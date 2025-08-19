"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { setSeiAddress } from '@/lib/redux/userSlice';
import { createSplitDappActor } from '@/lib/icp/splitDapp';
import { Typography } from '@/components/ui/typography';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Copy, RefreshCw, Wallet, Check, CircleCheckBig } from 'lucide-react';

export default function SEIAddress() {
	const dispatch = useDispatch();
	const { principal, seiAddress } = useUser();
	const [isGenerating, setIsGenerating] = useState(false);
	const [isCopied, setIsCopied] = useState(false);

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
				setIsCopied(true);
				toast.success('SEI address copied to clipboard!');
				setTimeout(() => setIsCopied(false), 2000);
			} catch (error) {
				console.error('Failed to copy address:', error);
				toast.error('Failed to copy address to clipboard');
			}
		}
	};

	return (
		<div className="container space-y-4 space-x-2 !p-5">
			<div className="flex justify-between">
				<div>
					<Typography variant='h3'>SEI address</Typography>
					<Typography variant='muted'>Your SEI address for receiving payments</Typography>
				</div>
			</div>
			<div className="container flex items-center justify-between">
				<div className='flex items-center gap-2'>
					<div className="bg-[#4F3F27] p-2 rounded-full">
						<Wallet color="#FEB64D" />
					</div>
					<Typography variant='muted'>{seiAddress}</Typography>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={copyAddress}
						className="text-gray-300 border-gray-600 hover:bg-gray-700"
					>
						{isCopied ? <Check size={14} /> : <Copy size={14} />}
					</Button>
				</div>
			</div>
			<div className="container-success flex items-start gap-2">
				<div className="h5">
					<CircleCheckBig color="#00C287" />
				</div>
				<div>
					<Typography variant='base' className='text-[#00C287]'>Address configured</Typography>
					<Typography variant='muted' className='text-white'>Default address will be used when escrows are released, unless otherwise selected.</Typography>
				</div>
			</div>
		</div>
	);
}
