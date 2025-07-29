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

function BalanceAndNameSyncer() {
  const principal = useAppSelector((state: any) => state.user.principal)
  const { authClient } = useAuth()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!principal || !authClient) return

    ;(async () => {
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
        } catch (err) {
          console.error('❌ Could not fetch balance:', err)
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
        } catch (err) {
          console.error('❌ Could not fetch nickname:', err)
          dispatch(setUserName(null))
        }

        // Fetch Transactions
        try {
          const result = await actor.getTransactionsPaginated(principalObj, BigInt(0), BigInt(10)) as any
          const normalizeTx = (tx: any) => ({
            ...tx,
            from: typeof tx.from === 'object' && tx.from.toText ? tx.from.toText() : String(tx.from),
            timestamp: typeof tx.timestamp === 'bigint' ? tx.timestamp.toString() : String(tx.timestamp),
            releasedAt: Array.isArray(tx.releasedAt) && tx.releasedAt.length > 0
              ? tx.releasedAt[0].toString()
              : null,
            to: tx.to.map((toEntry: any) => ({
              ...toEntry,
              principal:
                typeof toEntry.principal === 'object' && toEntry.principal.toText
                  ? toEntry.principal.toText()
                  : String(toEntry.principal),
              amount: typeof toEntry.amount === 'bigint' ? toEntry.amount.toString() : String(toEntry.amount),
            })),
          })
          const normalizedTxs = (result.transactions as any[]).map(normalizeTx)
          dispatch(setTransactions(normalizedTxs))
        } catch (err) {
          console.error('❌ Could not fetch transactions:', err)
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
  const principal = useAppSelector((state: any) => state.user.principal)
  const name = useAppSelector((state: any) => state.user.name)
  const title = useSelector((state: any) => state.layout.title)
  const subtitle = useSelector((state: any) => state.layout.subtitle)

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
