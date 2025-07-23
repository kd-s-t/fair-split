/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Badge from '../../components/ui/badge'
import { Tabs, Tab } from '@/components/ui/tabs' // Assume you have or will create these
import { Bitcoin, ShieldCheck, Clock, Zap, CheckCircle } from 'lucide-react'
import { useAppSelector } from '@/lib/redux/store';
import type { RootState } from '@/lib/redux/store';
import { createSplitDappActor } from '@/lib/icp/splitDapp';
import { useRouter } from 'next/navigation';

// Mock data for stats and transactions
const stats = [
  { label: 'Total escrows', value: 24, change: '+ 2 this week', icon: <Clock className="w-5 h-5" /> },
  { label: 'Active escrows', value: 6, icon: <Zap className="w-5 h-5" /> },
  { label: 'Completed escrows', value: 17, change: '+ 1 today', icon: <CheckCircle className="w-5 h-5" /> },
  { label: 'Pending escrows', value: 1, icon: <Clock className="w-5 h-5" /> },
]

const transactions = [
  {
    id: 'tx1',
    title: 'Freelance project payment',
    status: 'Active',
    date: 'Jul 15, 06:30 PM',
    direction: 'Sent',
    recipients: [
      { address: 'bc1qxy2k...fjhx0wlh', percent: 60, amount: 0.003 },
      { address: 'bc1qw508...7kv8ft34', percent: 40, amount: 0.002 },
    ],
    total: 0.005,
    currency: 'BTC',
  },
  {
    id: 'tx2',
    title: 'NFT collab - July share',
    status: 'Completed',
    date: 'Jul 12, 07:29 PM',
    direction: 'Receiving',
    sender: { address: 'bc1qar0s...zzwf5mdq' },
    total: 0.01,
    currency: 'BTC',
  },
]

const tabs = [
  { label: 'All transactions', count: 5 },
  { label: 'Sent', count: 3 },
  { label: 'Received', count: 2 },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState(0)
  const btcBalance = useAppSelector((state: RootState) => state.user.btcBalance);
  const principal = useAppSelector((state: RootState) => state.user.principal);
  const router = useRouter();

  return (
    <motion.div
      className="p-8 max-w-5xl mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-gray-400 mb-2">Manage your Bitcoin escrow transactions with confidence</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-mono font-semibold">
              {btcBalance !== undefined && btcBalance !== null ? `${btcBalance} BTC` : '—'}
            </span>
            {/* Optionally, you can fetch and show USD value if you have a price API */}
            {/* <span className="text-gray-400 text-lg">$438,730.15</span> */}
            <Badge className="ml-2 bg-green-900 text-green-400">24H</Badge>
          </div>
        </div>
        <Button className="bg-amber-400 text-black font-semibold hover:bg-amber-500 px-6 py-2 rounded-lg shadow" size="lg" onClick={() => router.push('/escrow')}>
          + New escrow
        </Button>
      </div>

      {/* Security Banner */}
      <div className="flex items-center gap-3 bg-slate-800 text-slate-100 rounded-lg px-6 py-3">
        <ShieldCheck className="w-6 h-6 text-amber-400" />
        <span>Secured by ICP threshold ECDSA • No bridges, no wrapped BTC</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={stat.label} className="bg-slate-900 text-white p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-lg font-semibold">
              {stat.icon}
              {stat.label}
            </div>
            <div className="text-2xl font-mono font-bold">{stat.value}</div>
            {stat.change && <div className="text-green-400 text-sm">{stat.change}</div>}
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Recent activity</h3>
          <Button variant="ghost" className="text-amber-400">View all transactions &rarr;</Button>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {tabs.map((tab, idx) => (
            <Button
              key={tab.label}
              variant={activeTab === idx ? 'default' : 'ghost'}
              className={activeTab === idx ? 'bg-amber-400 text-black' : 'text-gray-400'}
              onClick={() => setActiveTab(idx)}
            >
              {tab.label} <span className="ml-1 text-xs">({tab.count})</span>
            </Button>
          ))}
        </div>
        {/* Transaction Cards */}
        <div className="space-y-4">
          {transactions.map(tx => (
            <Card key={tx.id} className="bg-slate-900 text-white p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">{tx.title}</div>
                <Badge className={
                  tx.status === 'Active'
                    ? 'bg-blue-900 text-blue-400'
                    : 'bg-green-900 text-green-400'
                }>
                  {tx.status}
                </Badge>
              </div>
              <div className="text-xs text-gray-400 mb-2">{tx.date} • {tx.direction && <span>{tx.direction}</span>}</div>
              {tx.recipients && (
                <div className="mb-2">
                  <div className="font-medium text-sm mb-1">Recipients ({tx.recipients.length})</div>
                  <div className="space-y-1">
                    {tx.recipients.map((r, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span>{r.address}</span>
                        <span>{r.percent}% • {r.amount.toFixed(8)} BTC</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tx.sender && (
                <div className="mb-2">
                  <div className="font-medium text-sm mb-1">Sender</div>
                  <div className="text-xs">{tx.sender.address}</div>
                </div>
              )}
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-400">Total escrow:</div>
                <div className="flex items-center gap-1 font-mono font-semibold">
                  <Bitcoin className="w-4 h-4 text-amber-400" />
                  {tx.total.toFixed(8)} BTC
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <Button variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black">
                  {tx.status === 'Active' ? 'Manage escrow' : 'View escrow'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
