"use client";

import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/hooks/useUser';
import { setSubtitle, setTitle } from '@/lib/redux/store';
import { setCkbtcAddress, setCkbtcBalance, setIcpBalance, setSeiAddress, setSeiBalance } from '@/lib/redux/userSlice';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import BitcoinAddress from './BitcoinAddress';
import CKBTCBalance from './CKBTCBalance';
import ICPBalance from './ICPBalance';
import SEIBalance from './SEIBalance';
import SEIAddress from './SEIAddress';

export default function Integrations() {
	const dispatch = useDispatch();
	const { principal } = useAuth();
	const { ckbtcAddress, seiAddress } = useUser();
	const [isInitializing, setIsInitializing] = useState(true);

	useEffect(() => {
		dispatch(setTitle('Integrations'));
		dispatch(setSubtitle('Manage your multi-chain wallets'));
	}, [dispatch]);

	// Initialize wallets and balances on load
	useEffect(() => {
		const initializeWallets = async () => {
			if (!principal) return;

			setIsInitializing(true);
			try {
				const { createSplitDappActor } = await import('@/lib/icp/splitDapp');
				const actor = await createSplitDappActor();

				// Get ICP balance and store in Redux
				try {
					const icpBalanceResult = await actor.getBalance(principal) as bigint;
					console.log('ICP Balance:', icpBalanceResult.toString());
					dispatch(setIcpBalance(icpBalanceResult.toString()));
				} catch (error) {
					console.error('Failed to get ICP balance:', error);
				}

				// Get cKBTC balance for the specific user
				const balanceResult = await actor.getCkbtcBalance(principal) as { ok: number } | { err: string };
				if ('ok' in balanceResult) {
					dispatch(setCkbtcBalance(balanceResult.ok.toString()));
				} else {
					console.error('Failed to get cKBTC balance:', balanceResult.err);
					dispatch(setCkbtcBalance('0'));
				}

				// Get SEI balance for the specific user
				try {
					const seiBalanceResult = await actor.getSeiBalance(principal) as { ok: number } | { err: string };
					if ('ok' in seiBalanceResult) {
						dispatch(setSeiBalance(seiBalanceResult.ok.toString()));
					} else {
						console.error('Failed to get SEI balance:', seiBalanceResult.err);
						dispatch(setSeiBalance('0'));
					}
				} catch (error) {
					console.error('Failed to get SEI balance:', error);
					dispatch(setSeiBalance('0'));
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

				// If no SEI address exists, generate one
				if (!seiAddress) {
					try {
						const seiWalletResult = await actor.requestSeiWalletAnonymous() as { ok: { seiAddress: string } } | { err: string };
						if ('ok' in seiWalletResult) {
							dispatch(setSeiAddress(seiWalletResult.ok.seiAddress));
						} else {
							console.error('Failed to generate SEI wallet:', seiWalletResult.err);
							toast.error('Failed to generate SEI wallet: ' + seiWalletResult.err);
						}
					} catch (error) {
						console.error('Failed to generate SEI wallet:', error);
						toast.error('Failed to generate SEI wallet. Please try again.');
					}
				}
			} catch (error) {
				console.error('Error initializing wallets:', error);
				// Only show error if we don't already have addresses
				if (!ckbtcAddress && !seiAddress) {
					toast.error('Failed to initialize wallets. Please try again.');
				}
			} finally {
				setIsInitializing(false);
			}
		};

		if (principal) {
			initializeWallets();
		}
	}, [principal, dispatch, ckbtcAddress, seiAddress]);

	if (!principal) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					<Card className="bg-[#222222] border-[#303434] text-white">
						<CardContent className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
							<span className="ml-3 text-gray-300">Loading your wallets...</span>
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
							<span className="ml-3 text-gray-300">Initializing wallets...</span>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<ICPBalance />
				<CKBTCBalance />
				<SEIBalance />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<BitcoinAddress />
				<SEIAddress />
			</div>
		</div>
	);
} 