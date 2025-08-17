'use client'

import React, { ReactNode, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, useAppSelector, store } from '../lib/redux/store'
import { Provider } from 'react-redux'
import { useAuth } from '@/contexts/auth-context'
import Header from '@/components/Header'
import Sidebar from '@/components/SideBar'
import AuthOverlay from '@/components/AuthOverlay'
import RightSidebar from '@/modules/chat/RightSidebar'
import { setIcpBalance, setUserName, setCkbtcBalance } from '../lib/redux/userSlice'
import { setTransactions } from '../lib/redux/transactionsSlice'
import { createSplitDappActorAnonymous } from '@/lib/icp/splitDapp'
import { Principal } from '@dfinity/principal'
import type { NormalizedTransaction } from '@/modules/transactions/types'
import { BotMessageSquare } from 'lucide-react'

// Environment variable logging (client-safe, explicit keys only)
const logEnvironmentVariables = () => {
  console.log('🌍 Environment Variables:')
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('NEXT_PUBLIC_* (explicit):', {
    NEXT_PUBLIC_DFX_HOST: process.env.NEXT_PUBLIC_DFX_HOST,
    NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP: process.env.NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
    NEXT_PUBLIC_DEVELOPMENT_DOMAIN: process.env.NEXT_PUBLIC_DEVELOPMENT_DOMAIN,
    NEXT_PUBLIC_BLOCKSTREAM_URL: process.env.NEXT_PUBLIC_BLOCKSTREAM_URL,
    NEXT_PUBLIC_MEMPOOL_URL: process.env.NEXT_PUBLIC_MEMPOOL_URL,
    NEXT_PUBLIC_ICP_DASHBOARD_URL: process.env.NEXT_PUBLIC_ICP_DASHBOARD_URL,
    NEXT_PUBLIC_ICSCAN_URL: process.env.NEXT_PUBLIC_ICSCAN_URL,
  })
  console.log('🌍 End Environment Variables')
}

function BalanceAndNameSyncer() {
  const principal = useAppSelector((state: RootState) => state.user.principal)
  const { authClient } = useAuth()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!principal || !authClient) return

    (async () => {
      try {
        const isAuthenticated = await authClient.isAuthenticated()
        if (!isAuthenticated) {
          console.warn('User not authenticated, skipping backend calls')
          dispatch(setCkbtcBalance(null))
          dispatch(setUserName(null))
          dispatch(setTransactions([]))
          return
        }

        const actor = await createSplitDappActorAnonymous()
        const principalObj = Principal.fromText(principal)

        // Fetch ICP Balance
        try {
          const icpBalance = await actor.getBalance(principalObj)
          const formattedIcp = (Number(icpBalance) / 1e8).toFixed(8)
          dispatch(setIcpBalance(formattedIcp))
        } catch {
          dispatch(setIcpBalance(null))
        }

        // Fetch CKBT Balance
        try {
          const ckbtcBalanceResult = await actor.getCkbtcBalance(principalObj) as { ok: number } | { err: string }
          if ('ok' in ckbtcBalanceResult) {
            const formattedCkbtc = (Number(ckbtcBalanceResult.ok) / 1e8).toFixed(8)
            dispatch(setCkbtcBalance(formattedCkbtc))
          } else {
            console.error('Failed to get cKBTC balance:', ckbtcBalanceResult.err)
            dispatch(setCkbtcBalance(null))
          }
        } catch (error) {
          console.error('Error fetching cKBTC balance:', error)
          dispatch(setCkbtcBalance(null))
        }

        // Fetch Nickname
        try {
          const nameResult = await actor.getNickname(principalObj)
          if (Array.isArray(nameResult) && nameResult.length > 0) {
            dispatch(setUserName(nameResult[0]))
          } else {
            dispatch(setUserName(null))
          }
        } catch {
          console.error('❌ Could not fetch nickname')
          dispatch(setUserName(null))
        }

        // Note: cKBTC address is generated via requestCkbtcWallet() in the integrations page
        // We don't need to fetch it here since it's handled in the integrations flow

        // Fetch Transactions
        try {
          const result = await actor.getTransactionsPaginated(principalObj, BigInt(0), BigInt(10)) as { transactions: unknown[] }
          const normalizeTx = (tx: unknown) => {
            const serializeTimestamp = (value: unknown) => {
              if (!value) return undefined;
              return typeof value === 'bigint' ? value.toString() : String(value);
            };

            const serializeArrayTimestamp = (value: unknown) => {
              if (Array.isArray(value) && value.length > 0) {
                return value[0].toString();
              }
              return serializeTimestamp(value);
            };

            const txObj = tx as Record<string, unknown>;
            const hasToText = (obj: unknown): obj is { toText: () => string } => {
              return typeof obj === 'object' && obj !== null && 'toText' in obj && typeof (obj as Record<string, unknown>).toText === 'function';
            };

            return {
              ...txObj,
              id: txObj.id as string,
              status: txObj.status as string,
              title: txObj.title as string,
              from: hasToText(txObj.from) ? txObj.from.toText() : String(txObj.from),
              createdAt: serializeTimestamp(txObj.createdAt || '0'),
              confirmedAt: serializeTimestamp(txObj.confirmedAt),
              cancelledAt: serializeTimestamp(txObj.cancelledAt),
              refundedAt: serializeTimestamp(txObj.refundedAt),
              releasedAt: serializeArrayTimestamp(txObj.releasedAt),
              readAt: serializeTimestamp(txObj.readAt),
              bitcoinTransactionHash: Array.isArray(txObj.bitcoinTransactionHash) && txObj.bitcoinTransactionHash.length > 0
                ? txObj.bitcoinTransactionHash[0]
                : txObj.bitcoinTransactionHash,
              bitcoinAddress: Array.isArray(txObj.bitcoinAddress) && txObj.bitcoinAddress.length > 0
                ? txObj.bitcoinAddress[0]
                : txObj.bitcoinAddress,
              to: (txObj.to as unknown[]).map((toEntry: unknown) => {
                const entry = toEntry as Record<string, unknown>;
                return {
                  ...entry,
                  principal: hasToText(entry.principal) ? entry.principal.toText() : String(entry.principal),
                  amount: typeof entry.amount === 'bigint' ? entry.amount.toString() : String(entry.amount),
                  percentage: typeof entry.percentage === 'bigint' ? entry.percentage.toString() : String(entry.percentage),
                  status: entry.status as unknown,
                  name: entry.name as string,
                  approvedAt: serializeTimestamp(entry.approvedAt),
                  declinedAt: serializeTimestamp(entry.declinedAt),
                  readAt: serializeTimestamp(entry.readAt),
                };
              }),
            };
          };
          const normalizedTxs = (result.transactions as unknown[]).map(normalizeTx) as NormalizedTransaction[];
          dispatch(setTransactions(normalizedTxs))
        } catch {
          console.error('❌ Could not fetch transactions')
          dispatch(setTransactions([]))
        }
      } catch (error) {
        console.error('🔥 Unexpected error in BalanceAndNameSyncer:', error)
        dispatch(setCkbtcBalance(null))
        dispatch(setUserName(null))
        dispatch(setTransactions([]))
      }
    })()
  }, [principal, authClient, dispatch])

  return null
}

function ClientLayoutContent({ children }: { children: ReactNode }) {
  const principal = useAppSelector((state: RootState) => state.user.principal)
  const name = useAppSelector((state: RootState) => state.user.name)
  const title = useSelector((state: RootState) => state.layout.title)
  const subtitle = useSelector((state: RootState) => state.layout.subtitle)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = React.useState(false)

  // Log environment variables on app startup
  useEffect(() => {
    logEnvironmentVariables()
  }, [])

  // Prevent body scroll when sidebar is open
  React.useEffect(() => {
    if (isRightSidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isRightSidebarOpen]);

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar className="flex flex-col h-screen w-48" />
      <main className="flex flex-col h-screen flex-1 transition-all duration-300">
        <Header
          title={title}
          subtitle={subtitle}
          user={{
            principalId: principal ?? '',
            name: name || undefined,
          }}
        />
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
      {isRightSidebarOpen && (
        <RightSidebar isOpen={isRightSidebarOpen} onToggle={toggleRightSidebar} className="flex flex-col h-screen w-80" />
      )}
      {!isRightSidebarOpen && (
        <button
          onClick={toggleRightSidebar}
          className="fixed right-4 bottom-10 z-50 bg-[#FEB64D] rounded-full py-3 px-3"
        >
          <BotMessageSquare />
        </button>
      )}
      <AuthOverlay />
      <BalanceAndNameSyncer />
    </div>
  )
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </Provider>
  )
} 