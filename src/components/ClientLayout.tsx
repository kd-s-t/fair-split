'use client'

import { ReactNode, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, useAppSelector, store } from '../lib/redux/store'
import { Provider } from 'react-redux'
import { useAuth } from '@/contexts/auth-context'
import Header from '@/components/Header'
import Sidebar from '@/components/SideBar'
import { MessagingSystem } from '@/components/messaging/MessagingSystem'
import AuthOverlay from '@/components/AuthOverlay'
import { setIcpBalance, setBtcBalance, setUserName, setBtcAddress } from '../lib/redux/userSlice'
import { setTransactions } from '../lib/redux/transactionsSlice'
import { createSplitDappActorAnonymous } from '@/lib/icp/splitDapp'
import { Principal } from '@dfinity/principal'
import type { NormalizedTransaction } from '@/modules/transactions/types'

// Environment variable logging
const logEnvironmentVariables = () => {
  console.log('🌍 Environment Variables:')
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('NEXT_PUBLIC_* variables:')
  
  // Log all NEXT_PUBLIC_ variables
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('NEXT_PUBLIC_')) {
      console.log(`  ${key}:`, process.env[key])
    }
  })
  
  // Log other important variables (without exposing sensitive data)
  const safeVars = ['NODE_ENV', 'VERCEL_ENV', 'VERCEL_URL', 'NEXT_PUBLIC_VERCEL_URL']
  safeVars.forEach(key => {
    if (process.env[key]) {
      console.log(`  ${key}:`, process.env[key])
    }
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
          dispatch(setBtcBalance(null))
          dispatch(setUserName(null))
          dispatch(setTransactions([]))
          return
        }

        const actor = await createSplitDappActorAnonymous()
        const principalObj = Principal.fromText(principal)

        // Fetch ICP Balance
        try {
          const icpBalance = await actor.getBalance(principalObj)
          console.log('Raw ICP balance from canister:', icpBalance)
          const formattedIcp = (Number(icpBalance) / 1e8).toFixed(8)
          console.log('Formatted ICP balance:', formattedIcp)
          dispatch(setIcpBalance(formattedIcp))
        } catch {
          console.error('❌ Could not fetch ICP balance')
          dispatch(setIcpBalance(null))
        }

        // Fetch Bitcoin Balance
        try {
          const btcBalance = await actor.getUserBitcoinBalance(principalObj)
          const formattedBtc = (Number(btcBalance) / 1e8).toFixed(8)
          dispatch(setBtcBalance(formattedBtc))
        } catch {
          console.error('❌ Could not fetch Bitcoin balance')
          dispatch(setBtcBalance(null))
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

        // Fetch Bitcoin Address
        try {
          const btcAddress = await actor.getBitcoinAddress(principalObj)
          // btcAddress is an array or opt type, so handle accordingly
          const address = Array.isArray(btcAddress) ? btcAddress[0] : btcAddress;
          dispatch(setBtcAddress(address ? String(address) : null))
        } catch {
          console.error('❌ Could not fetch Bitcoin address')
          dispatch(setBtcAddress(null))
        }

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
        dispatch(setBtcBalance(null))
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

  // Log environment variables on app startup
  useEffect(() => {
    logEnvironmentVariables()
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden flex">
      <Sidebar />
      <main className="flex-1 flex flex-col">
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
      <AuthOverlay />
      <BalanceAndNameSyncer />
      <MessagingSystem />
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