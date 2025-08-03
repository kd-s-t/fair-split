'use client'

import './globals.css'
import { ReactNode, useEffect } from 'react'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/Header'
import Sidebar from '@/components/SideBar'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { store, useAppSelector } from '../lib/redux/store'
import AuthOverlay from '@/components/AuthOverlay'
import { setBtcBalance, setUserName } from '../lib/redux/userSlice'
import { setTransactions } from '../lib/redux/transactionsSlice'
import { createSplitDappActorAnonymous } from '@/lib/icp/splitDapp'
import { Principal } from '@dfinity/principal'

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

        // Fetch BTC Balance
        try {
          const balance = await actor.getBalance(principalObj)
          const formatted = (Number(balance) / 1e8).toFixed(8)
          dispatch(setBtcBalance(formatted))
        } catch {
          console.error('❌ Could not fetch balance')
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

            return {
              ...tx,
              from: typeof tx.from === 'object' && tx.from.toText ? tx.from.toText() : String(tx.from),
              createdAt: serializeTimestamp(tx.createdAt || '0'),
              confirmedAt: serializeTimestamp(tx.confirmedAt),
              cancelledAt: serializeTimestamp(tx.cancelledAt),
              refundedAt: serializeTimestamp(tx.refundedAt),
              releasedAt: serializeArrayTimestamp(tx.releasedAt),
              readAt: serializeTimestamp(tx.readAt),
              bitcoinTransactionHash: Array.isArray(tx.bitcoinTransactionHash) && tx.bitcoinTransactionHash.length > 0
                ? tx.bitcoinTransactionHash[0]
                : tx.bitcoinTransactionHash,
              bitcoinAddress: Array.isArray(tx.bitcoinAddress) && tx.bitcoinAddress.length > 0
                ? tx.bitcoinAddress[0]
                : tx.bitcoinAddress,
              to: (tx as Record<string, unknown>).to.map((toEntry: unknown) => ({
                ...toEntry,
                principal: typeof toEntry.principal === 'object' && toEntry.principal.toText
                  ? toEntry.principal.toText()
                  : String(toEntry.principal),
                amount: typeof toEntry.amount === 'bigint' ? toEntry.amount.toString() : String(toEntry.amount),
                percentage: typeof toEntry.percentage === 'bigint' ? toEntry.percentage.toString() : String(toEntry.percentage),
                approvedAt: serializeTimestamp(toEntry.approvedAt),
                declinedAt: serializeTimestamp(toEntry.declinedAt),
                readAt: serializeTimestamp(toEntry.readAt),
              })),
            };
          };
          const normalizedTxs = (result.transactions as unknown[]).map(normalizeTx)
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

function LayoutShell({ children }: { children: ReactNode }) {
  const principal = useAppSelector((state: RootState) => state.user.principal)
  const name = useAppSelector((state: RootState) => state.user.name)
  const title = useSelector((state: RootState) => state.layout.title)
  const subtitle = useSelector((state: RootState) => state.layout.subtitle)

  return (
    <div className="relative w-screen h-screen overflow-hidden flex">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header
          title={title}
          subtitle={subtitle}
          user={{
            principalId: principal,
            name: name || undefined,
          }}
        />
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
      <AuthOverlay />
      <BalanceAndNameSyncer />
    </div>
  )
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // Log environment variables on app startup
  useEffect(() => {
    logEnvironmentVariables()
  }, [])

  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <AuthProvider>
            <LayoutShell>{children}</LayoutShell>
          </AuthProvider>
        </Provider>
        <Toaster />
      </body>
    </html>
  )
}
