"use client"

import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { createSplitDappActor } from '@/lib/icp/splitDapp'
import { useDispatch, useSelector } from 'react-redux'
import { setTransactions } from '@/lib/redux/transactionsSlice'
import type { RootState } from '@/lib/redux/store'
import { motion } from 'framer-motion'
import DashboardStats from '@/components/DashboardStats'
import RecentActivities from '@/components/RecentActivities'
import type { Transaction } from '@/declarations/split_dapp.did'

export default function DashboardPage() {
  const { principal } = useAuth()
  const transactions = useSelector((state: RootState) => state.transactions.transactions)
  const dispatch = useDispatch()
  
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!principal) return
      const actor = await createSplitDappActor()
      const txs = await actor.getTransactions(principal) as Transaction[]
      const normalizeTx = (tx: any) => ({
        ...tx,
        from: typeof tx.from === 'object' && tx.from.toText ? tx.from.toText() : String(tx.from),
        timestamp: typeof tx.timestamp === 'bigint' ? tx.timestamp.toString() : String(tx.timestamp),
        to: tx.to.map((toEntry: any) => ({
          ...toEntry,
          principal: typeof toEntry.principal === 'object' && toEntry.principal.toText
            ? toEntry.principal.toText()
            : String(toEntry.principal),
          amount: typeof toEntry.amount === 'bigint' ? toEntry.amount.toString() : String(toEntry.amount),
        })),
      });
      const normalizedTxs = txs.map(normalizeTx);
      console.log("normalize",normalizedTxs)
      dispatch(setTransactions(normalizedTxs))
    }
    fetchTransactions()
  }, [principal, dispatch])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardStats transactions={transactions} />
      <RecentActivities transactions={transactions} />
    </motion.div>
  )
}
