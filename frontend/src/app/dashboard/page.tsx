/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { motion } from 'framer-motion'
import DashboardStats from '@/components/DashboardStats'
import RecentActivities from '@/components/RecentActivities'

export default function DashboardPage() {
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardStats />
      <RecentActivities />
    </motion.div>
  )
}
