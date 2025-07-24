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
import type { Transaction } from '@/declarations/split_dapp/split_dapp.did'

export default function DashboardPage() {
  const { principal } = useAuth()
  const transactions = useSelector((state: RootState) => state.transactions.transactions)
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!principal) return
      const actor = await createSplitDappActor()
      const txs = await actor.getTransactions(principal) as Transaction[]
      console.log("txs", txs)
      dispatch(setTransactions(txs))
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
