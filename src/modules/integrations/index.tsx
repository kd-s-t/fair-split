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

			// Add timeout to prevent getting stuck
			const timeout = setTimeout(() => {
				console.warn('Wallet initialization timed out');
				setIsInitializing(false);
			}, 10000); // 10 second timeout
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
					dispatch(setIcpBalance('0'));
				}

				// Get cKBTC balance for the specific user
				try {
					const balanceResult = await actor.getUserBitcoinBalance(principal) as number;
					console.log('🔍 DEBUG: Raw balance from canister:', balanceResult);
					console.log('🔍 DEBUG: Balance in satoshis:', balanceResult);
					const formattedBalance = (Number(balanceResult) / 1e8).toFixed(8);
					console.log('🔍 DEBUG: Balance in BTC:', formattedBalance);
					dispatch(setCkbtcBalance(formattedBalance));
				} catch (error) {
					console.error('Failed to get cKBTC balance:', error);
					dispatch(setCkbtcBalance('0.00000000'));
				}

				// Get SEI balance for the specific user
				try {
					const seiBalanceResult = await actor.getSeiBalance(principal) as { ok: number } | { err: string };
					if ('ok' in seiBalanceResult) {
						const formattedSeiBalance = (Number(seiBalanceResult.ok) / 1e6).toFixed(6);
						dispatch(setSeiBalance(formattedSeiBalance));
					} else {
						console.error('Failed to get SEI balance:', seiBalanceResult.err);
						dispatch(setSeiBalance('0.000000'));
					}
				} catch (error) {
					console.error('Failed to get SEI balance:', error);
					dispatch(setSeiBalance('0.000000'));
				}

				// Generate cKBTC address if not already present
				if (!ckbtcAddress) {
					try {
						const walletResult = await actor.requestCkbtcWallet() as { ok: { btcAddress: string } } | { err: string };
						if ('ok' in walletResult) {
							dispatch(setCkbtcAddress(walletResult.ok.btcAddress));
						} else {
							console.error('Failed to generate cKBTC wallet:', walletResult.err);
						}
					} catch (error) {
						console.error('Error generating cKBTC wallet:', error);
					}
				}

				// Generate SEI address if not already present
				if (!seiAddress) {
					try {
						const seiWalletResult = await actor.requestSeiWalletAnonymous() as { ok: { seiAddress: string } } | { err: string };
						if ('ok' in seiWalletResult) {
							dispatch(setSeiAddress(seiWalletResult.ok.seiAddress));
						} else {
							console.error('Failed to generate SEI wallet:', seiWalletResult.err);
						}
					} catch (error) {
						console.error('Error generating SEI wallet:', error);
					}
				}
			} catch (error) {
				console.error('Error fetching balances:', error);
				toast.error('Failed to fetch balances. Please try again.');
			} finally {
				clearTimeout(timeout);
				setIsInitializing(false);
			}
		};

		if (principal) {
			initializeWallets();
		}
	}, [principal, dispatch, ckbtcAddress, seiAddress]);

	if (!principal) {
		return (
			<div className="space-y-6">
				{/* Top Row - Balance Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* ICP Balance Skeleton */}
					<Card>
						<CardContent className="p-6">
							<div className="animate-pulse">
								<div className="flex items-center justify-between mb-4">
									<div className="h-6 bg-gray-700 rounded w-24"></div>
									<div className="h-6 w-6 bg-gray-700 rounded"></div>
								</div>
								<div className="h-4 bg-gray-700 rounded w-48 mb-6"></div>
								<div className="h-8 bg-gray-700 rounded w-32 mb-4"></div>
								<div className="h-4 bg-gray-700 rounded w-24"></div>
							</div>
						</CardContent>
					</Card>

					{/* Bitcoin Balance Skeleton */}
					<Card>
						<CardContent className="p-6">
							<div className="animate-pulse">
								<div className="flex items-center justify-between mb-4">
									<div className="h-6 bg-gray-700 rounded w-32"></div>
									<div className="h-6 w-6 bg-gray-700 rounded"></div>
								</div>
								<div className="h-4 bg-gray-700 rounded w-48 mb-6"></div>
								<div className="h-8 bg-gray-700 rounded w-40 mb-4"></div>
								<div className="h-10 bg-gray-700 rounded w-full"></div>
							</div>
						</CardContent>
					</Card>

					{/* SEI Balance Skeleton */}
					<Card>
						<CardContent className="p-6">
							<div className="animate-pulse">
								<div className="flex items-center justify-between mb-4">
									<div className="h-6 bg-gray-700 rounded w-24"></div>
									<div className="h-6 w-6 bg-gray-700 rounded"></div>
								</div>
								<div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
								<div className="h-4 bg-gray-700 rounded w-24 mb-6"></div>
								<div className="h-8 bg-gray-700 rounded w-32 mb-4"></div>
								<div className="flex gap-2">
									<div className="h-10 bg-gray-700 rounded flex-1"></div>
									<div className="h-10 bg-gray-700 rounded flex-1"></div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Bottom Row - Address Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Bitcoin Address Skeleton */}
					<Card>
						<CardContent className="p-6">
							<div className="animate-pulse">
								<div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
								<div className="h-4 bg-gray-700 rounded w-48 mb-6"></div>
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-3 flex-1">
										<div className="h-10 w-10 bg-gray-700 rounded-full"></div>
										<div className="h-4 bg-gray-700 rounded w-64"></div>
									</div>
									<div className="flex gap-2">
										<div className="h-8 w-8 bg-gray-700 rounded"></div>
									</div>
								</div>
								<div className="flex items-start gap-2 p-3 bg-green-900/20 rounded">
									<div className="h-5 w-5 bg-green-600 rounded-full mt-0.5"></div>
									<div className="flex-1">
										<div className="h-4 bg-green-600 rounded w-32 mb-2"></div>
										<div className="h-3 bg-gray-600 rounded w-64"></div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* SEI Address Skeleton */}
					<Card>
						<CardContent className="p-6">
							<div className="animate-pulse">
								<div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
								<div className="h-4 bg-gray-700 rounded w-48 mb-6"></div>
								<div className="h-10 bg-gray-700 rounded w-full mb-4"></div>
								<div className="h-4 bg-gray-700 rounded w-32"></div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (isInitializing) {
		return (
			<div className="space-y-6">
				{/* Top Row - Balance Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* ICP Balance Skeleton */}
					<Card>
						<CardContent className="p-6">
							<div className="animate-pulse">
								<div className="flex items-center justify-between mb-4">
									<div className="h-6 bg-gray-700 rounded w-24"></div>
									<div className="h-6 w-6 bg-gray-700 rounded"></div>
								</div>
								<div className="h-4 bg-gray-700 rounded w-48 mb-6"></div>
								<div className="h-8 bg-gray-700 rounded w-32 mb-4"></div>
								<div className="h-4 bg-gray-700 rounded w-24"></div>
							</div>
						</CardContent>
					</Card>

					{/* Bitcoin Balance Skeleton */}
					<Card>
						<CardContent className="p-6">
							<div className="animate-pulse">
								<div className="flex items-center justify-between mb-4">
									<div className="h-6 bg-gray-700 rounded w-32"></div>
									<div className="h-6 w-6 bg-gray-700 rounded"></div>
								</div>
								<div className="h-4 bg-gray-700 rounded w-48 mb-6"></div>
								<div className="h-8 bg-gray-700 rounded w-40 mb-4"></div>
								<div className="h-10 bg-gray-700 rounded w-full"></div>
							</div>
						</CardContent>
					</Card>

					{/* SEI Balance Skeleton */}
					<Card>
						<CardContent className="p-6">
							<div className="animate-pulse">
								<div className="flex items-center justify-between mb-4">
									<div className="h-6 bg-gray-700 rounded w-24"></div>
									<div className="h-6 w-6 bg-gray-700 rounded"></div>
								</div>
								<div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
								<div className="h-4 bg-gray-700 rounded w-24 mb-6"></div>
								<div className="h-8 bg-gray-700 rounded w-32 mb-4"></div>
								<div className="flex gap-2">
									<div className="h-10 bg-gray-700 rounded flex-1"></div>
									<div className="h-10 bg-gray-700 rounded flex-1"></div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Bottom Row - Address Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Bitcoin Address Skeleton */}
					<Card>
						<CardContent className="p-6">
							<div className="animate-pulse">
								<div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
								<div className="h-4 bg-gray-700 rounded w-48 mb-6"></div>
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-3 flex-1">
										<div className="h-10 w-10 bg-gray-700 rounded-full"></div>
										<div className="h-4 bg-gray-700 rounded w-64"></div>
									</div>
									<div className="flex gap-2">
										<div className="h-8 w-8 bg-gray-700 rounded"></div>
										<div className="h-8 w-8 bg-gray-700 rounded"></div>
										<div className="h-8 w-8 bg-gray-700 rounded"></div>
									</div>
								</div>
								<div className="flex items-start gap-2 p-3 bg-green-900/20 rounded">
									<div className="h-5 w-5 bg-green-600 rounded-full mt-0.5"></div>
									<div className="flex-1">
										<div className="h-4 bg-green-600 rounded w-32 mb-2"></div>
										<div className="h-3 bg-gray-600 rounded w-64"></div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* SEI Address Skeleton */}
					<Card>
						<CardContent className="p-6">
							<div className="animate-pulse">
								<div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
								<div className="h-4 bg-gray-700 rounded w-48 mb-6"></div>
								<div className="h-10 bg-gray-700 rounded w-full mb-4"></div>
								<div className="h-4 bg-gray-700 rounded w-32"></div>
							</div>
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