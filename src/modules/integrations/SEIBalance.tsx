"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { setSeiBalance } from '@/lib/redux/userSlice';
import { createSplitDappActor } from '@/lib/icp/splitDapp';
import { Principal } from '@dfinity/principal';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { SEI_NETWORKS, SEI_FAUCETS } from '@/lib/constants';

export default function SEIBalance() {
	const dispatch = useDispatch();
	const { principal, seiBalance } = useUser();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [networkInfo, setNetworkInfo] = useState<{
		name: string;
		chainId: string;
		rpcUrl: string;
		explorerUrl: string;
		prefix: string;
		isTestnet: boolean;
	} | null>(null);
	const [faucetUrl, setFaucetUrl] = useState<string | null>(null);

	const updateSeiBalance = async () => {
		if (!principal) return;

		setIsRefreshing(true);
		try {
			const actor = await createSplitDappActor();
			const balanceResult = await actor.getSeiBalance(Principal.fromText(principal)) as { ok: number } | { err: string };
			
			if ('ok' in balanceResult) {
				// SEI has 6 decimal places (like most Cosmos tokens)
				const formatted = (Number(balanceResult.ok) / 1e6).toFixed(6);
				dispatch(setSeiBalance(formatted));
			} else {
				console.error('Failed to get SEI balance:', balanceResult.err);
				dispatch(setSeiBalance('0'));
			}
		} catch (error) {
			console.error('Error updating SEI balance:', error);
			dispatch(setSeiBalance('0'));
		} finally {
			setIsRefreshing(false);
		}
	};

	const getNetworkInfo = async () => {
		try {
			const actor = await createSplitDappActor();
			const networkResult = await actor.getSeiNetworkInfo() as {
				name: string;
				chainId: string;
				rpcUrl: string;
				explorerUrl: string;
				prefix: string;
				isTestnet: boolean;
			};
			setNetworkInfo(networkResult);
			
			// Get faucet URL if on testnet
			if (networkResult.isTestnet) {
				const faucetResult = await actor.getSeiFaucetUrl() as string | null;
				setFaucetUrl(faucetResult);
			}
		} catch (error) {
			console.error('Error getting SEI network info:', error);
		}
	};

	useEffect(() => {
		updateSeiBalance();
		getNetworkInfo();
	}, [principal]);

	return (
		<Card className="bg-[#222222] border-[#303434] text-white">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg font-semibold flex items-center gap-2">
					<div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
						<span className="text-xs font-bold text-white">S</span>
					</div>
					SEI Balance
					{networkInfo && (
						<span className="text-xs bg-purple-600 px-2 py-1 rounded-full">
							{networkInfo.name}
						</span>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					<div className="text-2xl font-bold text-purple-400">
						{seiBalance ? `${seiBalance} SEI` : '0.000000 SEI'}
					</div>
					<div className="text-sm text-gray-400">
						Sei Network Token
					</div>
					
					{networkInfo && (
						<div className="text-xs text-gray-500 space-y-1">
							<div>Network: {networkInfo.name}</div>
							<div>Chain ID: {networkInfo.chainId}</div>
							{networkInfo.isTestnet && (
								<div className="text-yellow-400">⚠️ Testnet - Use faucet for tokens</div>
							)}
						</div>
					)}

					<div className="flex gap-2">
						<Button
							onClick={updateSeiBalance}
							disabled={isRefreshing}
							className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
						>
							<RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
							{isRefreshing ? 'Refreshing...' : 'Refresh Balance'}
						</Button>
						
						{faucetUrl && (
							<Button
								onClick={() => window.open(faucetUrl, '_blank')}
								variant="outline"
								size="sm"
								className="bg-[#1a1a1a] border-[#404040] text-white hover:bg-[#2a2a2a]"
							>
								<ExternalLink className="w-4 h-4 mr-2" />
								Faucet
							</Button>
						)}
					</div>

					{networkInfo && networkInfo.explorerUrl && (
						<div className="text-xs">
							<Button
								onClick={() => window.open(networkInfo.explorerUrl, '_blank')}
								variant="ghost"
								size="sm"
								className="text-purple-400 hover:text-purple-300 p-0 h-auto"
							>
								<ExternalLink className="w-3 h-3 mr-1" />
								View on Explorer
							</Button>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
