"use client";

import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/hooks/useUser';
import { setSubtitle, setTitle } from '@/lib/redux/store';
import { setCkbtcAddress, setCkbtcBalance } from '@/lib/redux/userSlice';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import BitcoinAddress from './BitcoinAddress';
import CKBTCBalance from './CKBTCBalance';
import ICPBalance from './ICPBalance';

export default function Integrations() {
	const dispatch = useDispatch();
	const { principal } = useAuth();
	const { ckbtcAddress } = useUser();
	const [isInitializing, setIsInitializing] = useState(true);

	useEffect(() => {
		dispatch(setTitle('Integrations'));
		dispatch(setSubtitle('Manage your cKBTC wallet'));
	}, [dispatch]);

	// Initialize cKBTC wallet and balance on load
	useEffect(() => {
		const initializeCkbtc = async () => {
			if (!principal) return;

			setIsInitializing(true);
			try {
				const { createSplitDappActor } = await import('@/lib/icp/splitDapp');
				const actor = await createSplitDappActor();

				// Get cKBTC balance (anonymous for local development)
				const balanceResult = await actor.getCkbtcBalanceAnonymous() as { ok: number } | { err: string };
				if ('ok' in balanceResult) {
					dispatch(setCkbtcBalance(balanceResult.ok.toString()));
				} else {
					console.error('Failed to get cKBTC balance:', balanceResult.err);
					dispatch(setCkbtcBalance('0'));
				}

				// If no cKBTC address exists, generate one
				if (!ckbtcAddress) {
					const walletResult = await actor.requestCkbtcWalletAnonymous() as { ok: { btcAddress: string } } | { err: string };
					if ('ok' in walletResult) {
						dispatch(setCkbtcAddress(walletResult.ok.btcAddress));
					} else {
						console.error('Failed to generate cKBTC wallet:', walletResult.err);
						toast.error('Failed to generate cKBTC wallet: ' + walletResult.err);
					}
				}
			} catch (error) {
				console.error('Error initializing cKBTC:', error);
				// Only show error if we don't already have a cKBTC address
				if (!ckbtcAddress) {
					toast.error('Failed to initialize cKBTC wallet. Please try again.');
				}
			} finally {
				setIsInitializing(false);
			}
		};

		if (principal) {
			initializeCkbtc();
		}
	}, [principal, dispatch, ckbtcAddress]);

	if (!principal) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					<Card className="bg-[#222222] border-[#303434] text-white">
						<CardContent className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
							<span className="ml-3 text-gray-300">Loading your cKBTC wallet...</span>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (isInitializing) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					<Card className="bg-[#222222] border-[#303434] text-white">
						<CardContent className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
							<span className="ml-3 text-gray-300">Initializing cKBTC wallet...</span>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<ICPBalance />
				<CKBTCBalance />
			</div>
			<BitcoinAddress />
		</div>
	);
} 