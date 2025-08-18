"use client"

import { useSelector } from 'react-redux'
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { RootState } from '@/lib/redux/store'
import { motion } from 'framer-motion'
import DashboardStats from '@/modules/dashboard/Stats'
import RecentActivities from '@/modules/dashboard/Activities'
import { setTitle, setSubtitle } from "@/lib/redux/store";

export default function DashboardPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setTitle("Dashboard"));
    dispatch(setSubtitle("Your dashboard overview"));
  }, [dispatch]);

  const transactions = useSelector((state: RootState) => state.transactions.transactions)
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <DashboardStats transactions={transactions} />
      <RecentActivities />
    </motion.div>
  )
}
