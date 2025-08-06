"use client"

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { useAppSelector } from "@/lib/redux/store";
import type { RootState } from "@/lib/redux/store";
import { CircleCheck, Clock8, Eye, EyeOff, Plus, Shield, Zap } from "lucide-react";
import React, { useState, useEffect } from "react";
import type { NormalizedTransaction } from '@/modules/transactions/types'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardStats({ transactions }: { transactions: NormalizedTransaction[] }) {
  const btcBalance = useAppSelector((state: RootState) => state.user.btcBalance);
  // const _icpBalance = useAppSelector((state: RootState) => state.user.icpBalance);
  const isLoading =
    btcBalance === null || btcBalance === undefined || btcBalance === "";
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [displayBalance, setDisplayBalance] = useState("0.00000000");
  const [displayUsd, setDisplayUsd] = useState("$0.00");

  // Calculate transaction counts
  const totalEscrows = transactions ? transactions.length : 0;
  const activeEscrows = transactions ? transactions.filter(tx => tx.status === 'confirmed').length : 0;
  const completedEscrows = transactions ? transactions.filter(tx => tx.status === 'released').length : 0;
  const pendingEscrows = transactions ? transactions.filter(tx => tx.status === 'pending').length : 0;

  // Calculate ICP metrics (stored for potential future use)
  // const _totalIcpAmount = transactions ? transactions.reduce((sum, tx) => {
  //   if (tx.status === 'released') {
  //     return sum + tx.to.reduce((txSum, toEntry) => txSum + Number(toEntry.amount), 0) / 1e8;
  //   }
  //   return sum;
  // }, 0) : 0;

  const handleNewEscrow = () => {
    router.push('/escrow');
  };

  const handleToggleBalance = () => {
    setShowBalance((prev) => !prev);
  };

  // Animate balance when it becomes visible
  useEffect(() => {
    if (showBalance && btcBalance && !isLoading) {
      const targetBalance = Number(btcBalance);
      const targetUsd = btcToUsd(targetBalance);
      
      // Animate from 0 to target
      const duration = 1000; // 1 second
      const steps = 60;
      const increment = targetBalance / steps;
      const usdIncrement = targetUsd / steps;
      
      let current = 0;
      let currentUsd = 0;
      const interval = setInterval(() => {
        current += increment;
        currentUsd += usdIncrement;
        
        if (current >= targetBalance) {
          current = targetBalance;
          currentUsd = targetUsd;
          clearInterval(interval);
        }
        
        setDisplayBalance(current.toFixed(8));
        setDisplayUsd(`$${currentUsd.toLocaleString()}`);
      }, duration / steps);
      
      return () => clearInterval(interval);
    } else if (!showBalance) {
      setDisplayBalance("0.00000000");
      setDisplayUsd("$0.00");
    }
  }, [showBalance, btcBalance, isLoading]);

  return (
    <React.Fragment>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleToggleBalance}>
            <Typography variant="small">Portfolio balance</Typography>
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence mode="wait">
                {showBalance ? (
                  <motion.div
                    key="eye"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Eye size={16} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="eye-off"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <EyeOff size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div
            key={showBalance ? 'visible' : 'hidden'}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Typography variant="h2" className="font-semibold">
              {isLoading ? (
                <span className="inline-block w-32 h-7 bg-gray-200 animate-pulse rounded" />
              ) : showBalance ? (
                `${displayBalance} BTC`
              ) : (
                '•••••••• BTC'
              )}
            </Typography>
          </motion.div>

          <motion.div
            key={showBalance ? 'visible-usd' : 'hidden-usd'}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <Typography variant="muted">
              {showBalance ? displayUsd : '••••••••'}
            </Typography>
          </motion.div>
        </div>
        <Button
          variant="default"
          onClick={handleNewEscrow}
        >
          <Plus className="text-xs" /> New escrow
        </Button>
      </div>

      <div className="container w-full shadow-sm flex items-center gap-2 mt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative overflow-hidden"
        >
          <Shield color="#FEB64D" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        <Typography variant="muted" className="font-medium">
          Secured by ICP threshold ECDSA • No bridges, no wrapped BTC
        </Typography>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard
          label="Total escrows"
          value={totalEscrows}
          icon={<Shield className="text-yellow-400 text-2xl" />}
        />
        <StatCard
          label="Active escrows"
          value={activeEscrows}
          icon={<Zap className="text-blue-400 text-2xl" />}
        />
        <StatCard
          label="Completed escrows"
          value={completedEscrows}
          icon={<CircleCheck className="text-green-400 text-2xl" />}
        />
        <StatCard
          label="Pending escrows"
          value={pendingEscrows}
          icon={<Clock8 className="text-gray-400 text-2xl" />}
        />
      </div>

    </React.Fragment>
  );
};

import { StatCardProps } from './types';

const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => (
  <Card className="flex flex-col gap-6">
    <div className="flex items-center gap-2 mb-2 justify-between">
      <Typography variant="muted" className="text-sm">
        {label}
      </Typography>
      <span>{icon}</span>
    </div>
    <Typography variant="h3" className="font-semibold text-2xl">
      {value}
    </Typography>
  </Card>
);

function btcToUsd(btc: number) {
  const rate = 60000; // 1 BTC = $60,000 (example rate)
  return btc * rate;
}
