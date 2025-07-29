"use client"

import { useSelector } from 'react-redux'
import type { RootState } from '@/lib/redux/store'
import { motion } from 'framer-motion'
import DashboardStats from '@/modules/dashboard/Stats'
import RecentActivities from '@/modules/dashboard/Activities'

export default function DashboardPage() {
  const transactions = useSelector((state: RootState) => state.transactions.transactions)
  
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
