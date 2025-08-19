"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { setSeiBalance } from '@/lib/redux/userSlice';
import { createSplitDappActor } from '@/lib/icp/splitDapp';
import { Principal } from '@dfinity/principal';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ExternalLink, RefreshCw } from 'lucide-react';

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

	const updateSeiBalance = useCallback(async () => {
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
	}, [principal, dispatch]);

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
	}, [principal, updateSeiBalance]);

	return (
		<Card className="bg-[#222222] border-[#303434] text-white">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg font-semibold flex items-center justify-between">
					<div className="flex items-center gap-2">
						SEI Balance
						{networkInfo && (
							<span className="text-xs bg-purple-600 px-2 py-1 rounded-full">
								{networkInfo.name}
							</span>
						)}
					</div>
					<div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
						<span className="text-xs font-bold text-white">S</span>
					</div>
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
			</CardContent>
			
			<div className="px-6 pb-6 pt-4">
				<Button variant="outline" className='w-full bg-[#1a1a1a] border-[#404040] text-white hover:bg-[#2a2a2a]'>
					<ExternalLink className="w-4 h-4 mr-2" />
					<span>View on explorer</span>
				</Button>
			</div>
		</Card>
	);
}
