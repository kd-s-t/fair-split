"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { setSeiAddress } from '@/lib/redux/userSlice';
import { createSplitDappActor } from '@/lib/icp/splitDapp';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Copy, RefreshCw } from 'lucide-react';

export default function SEIAddress() {
	const dispatch = useDispatch();
	const { principal, seiAddress } = useUser();
	const [isGenerating, setIsGenerating] = useState(false);

	const generateSeiAddress = async () => {
		if (!principal) {
			toast.error('You must be logged in to generate a SEI address');
			return;
		}

		setIsGenerating(true);
		try {
			const actor = await createSplitDappActor();
			const walletResult = await actor.requestSeiWalletAnonymous() as { ok: { seiAddress: string } } | { err: string };
			
			if ('ok' in walletResult) {
				dispatch(setSeiAddress(walletResult.ok.seiAddress));
				toast.success('SEI wallet generated successfully!');
			} else {
				console.error('Failed to generate SEI wallet:', walletResult.err);
				toast.error('Failed to generate SEI wallet: ' + walletResult.err);
			}
		} catch (error) {
			console.error('Error generating SEI wallet:', error);
			toast.error('Failed to generate SEI wallet. Please try again.');
		} finally {
			setIsGenerating(false);
		}
	};

	const copyAddress = async () => {
		if (seiAddress) {
			try {
				await navigator.clipboard.writeText(seiAddress);
				toast.success('SEI address copied to clipboard!');
			} catch (error) {
				console.error('Failed to copy address:', error);
				toast.error('Failed to copy address to clipboard');
			}
		}
	};

	return (
		<Card className="bg-[#222222] border-[#303434] text-white">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg font-semibold flex items-center gap-2">
					<div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
						<span className="text-xs font-bold text-white">S</span>
					</div>
					SEI Wallet Address
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{seiAddress ? (
						<div className="space-y-3">
							<div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#404040]">
								<div className="text-sm text-gray-400 mb-1">Your SEI Address</div>
								<div className="font-mono text-sm text-purple-300 break-all">
									{seiAddress}
								</div>
							</div>
							<div className="flex gap-2">
								<Button
									onClick={copyAddress}
									variant="outline"
									size="sm"
									className="flex-1 bg-[#1a1a1a] border-[#404040] text-white hover:bg-[#2a2a2a]"
								>
									<Copy className="w-4 h-4 mr-2" />
									Copy Address
								</Button>
								<Button
									onClick={generateSeiAddress}
									disabled={isGenerating}
									variant="outline"
									size="sm"
									className="flex-1 bg-[#1a1a1a] border-[#404040] text-white hover:bg-[#2a2a2a]"
								>
									<RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
									{isGenerating ? 'Generating...' : 'Regenerate'}
								</Button>
							</div>
						</div>
					) : (
						<div className="space-y-3">
							<div className="text-center text-gray-400 py-4">
								No SEI wallet address found. Generate one to start using SEI tokens.
							</div>
							<Button
								onClick={generateSeiAddress}
								disabled={isGenerating}
								className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
							>
								<RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
								{isGenerating ? 'Generating SEI Wallet...' : 'Generate SEI Wallet'}
							</Button>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
