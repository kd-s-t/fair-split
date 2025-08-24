"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Plus, ArrowUpRight } from 'lucide-react';
import { useAppSelector } from '@/lib/redux/store';
import { RootState } from '@/lib/redux/store';
import { useRouter } from 'next/navigation';
import Withdraw from './Withdraw';
import { ckBtcToUsd } from '@/lib/utils';
import type { NormalizedTransaction } from '@/modules/transactions/types'

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, trend }) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <Typography variant="muted" className="text-xs">
          {description}
        </Typography>
      )}
      {trend && (
        <div className="flex items-center space-x-1 mt-1">
          <ArrowUpRight
            className={`h-3 w-3 ${
              trend.isPositive ? 'text-green-500 rotate-0' : 'text-red-500 rotate-180'
            }`}
          />
          <Typography variant="muted" className="text-xs">
            {trend.value}
          </Typography>
        </div>
      )}
    </CardContent>
  </Card>
);

export default function DashboardStats({ transactions }: { transactions: NormalizedTransaction[] }) {
  const ckbtcBalance = useAppSelector((state: RootState) => state.user.ckbtcBalance);
  // const _icpBalance = useAppSelector((state: RootState) => state.user.icpBalance);

  const isLoading =
    ckbtcBalance === null || ckbtcBalance === undefined || ckbtcBalance === "";

  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [displayBalance, setDisplayBalance] = useState("0.00000000");
  const [displayUsd, setDisplayUsd] = useState("$0.00");
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  // Calculate transaction counts
  const totalEscrows = transactions ? transactions.length : 0;
  const activeEscrows = transactions ? transactions.filter(tx => tx.status === 'confirmed').length : 0;
  const completedEscrows = transactions ? transactions.filter(tx => tx.status === 'released').length : 0;
  const pendingEscrows = transactions ? transactions.filter(tx => tx.status === 'pending').length : 0;

  // Calculate weekly escrow data for each category
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weeklyTotalEscrows = transactions ? transactions.filter(tx => {
    // Convert from nanoseconds to milliseconds (divide by 1,000,000)
    const txDate = new Date(Number(tx.createdAt) / 1000000);

    // Check if the date is valid
    if (isNaN(txDate.getTime())) {
      return false;
    }

    const isThisWeek = txDate >= oneWeekAgo;
    return isThisWeek;
  }).length : 0;

  const weeklyActiveEscrows = transactions ? transactions.filter(tx => {
    const txDate = new Date(Number(tx.createdAt) / 1000000);
    return txDate >= oneWeekAgo && tx.status === 'confirmed';
  }).length : 0;

  const weeklyCompletedEscrows = transactions ? transactions.filter(tx => {
    const txDate = new Date(Number(tx.createdAt) / 1000000);
    return txDate >= oneWeekAgo && tx.status === 'released';
  }).length : 0;

  const weeklyPendingEscrows = transactions ? transactions.filter(tx => {
    const txDate = new Date(Number(tx.createdAt) / 1000000);
    return txDate >= oneWeekAgo && tx.status === 'pending';
  }).length : 0;

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

  const handleWithdraw = (isOpen: boolean) => {
    setIsWithdrawOpen(isOpen)
  }

  const handleToggleBalance = () => {
    setShowBalance((prev) => !prev);
  };

  // Update balance display with real-time conversion
  useEffect(() => {
    const updateBalanceDisplay = async () => {
      if (showBalance && ckbtcBalance && !isLoading) {
        const targetBalance = Number(ckbtcBalance);
        setDisplayBalance(targetBalance.toFixed(8));

        // Get real-time USD conversion
        setIsLoadingPrice(true);
        try {
          const usdAmount = await ckBtcToUsd(targetBalance);
          setDisplayUsd(`$${usdAmount.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}`);
        } catch (error) {
          console.warn('Failed to get real-time price:', error);
          // Fallback to approximate calculation
          const fallbackUsd = targetBalance * 114764.80;
          setDisplayUsd(`$${fallbackUsd.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}`);
        } finally {
          setIsLoadingPrice(false);
        }
      } else {
        setDisplayBalance("0.00000000");
        setDisplayUsd("$0.00");
      }
    };

    updateBalanceDisplay();
  }, [showBalance, ckbtcBalance, isLoading]);

  // Animate balance when it becomes visible
  useEffect(() => {
    if (showBalance && ckbtcBalance && !isLoading) {
      const targetBalance = Number(ckbtcBalance);
      
      // Animate from 0 to target
      const duration = 1000; // 1 second
      const steps = 60;
      const increment = targetBalance / steps;

      let current = 0;
      const interval = setInterval(() => {
        current += increment;

        if (current >= targetBalance) {
          current = targetBalance;
          clearInterval(interval);
        }

        setDisplayBalance(current.toFixed(8));
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [showBalance, ckbtcBalance, isLoading]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Balance Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio balance</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleBalance}
              className="h-8 w-8 p-0"
            >
              {showBalance ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {showBalance ? displayBalance : "••••••••"}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Typography variant="muted" className="text-sm">
                ckBTC
              </Typography>
              {showBalance && (
                <Typography variant="muted" className="text-sm">
                  {isLoadingPrice ? "Loading..." : displayUsd}
                </Typography>
              )}
              <Badge variant="outline" className="text-xs">
                24H
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Escrows</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEscrows}</div>
            <Typography variant="muted" className="text-xs">
              +{weeklyTotalEscrows} this week
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Escrows</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEscrows}</div>
            <Typography variant="muted" className="text-xs">
              +{weeklyActiveEscrows} this week
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Completed Escrows"
          value={completedEscrows.toString()}
          description={`+${weeklyCompletedEscrows} this week`}
          trend={{
            value: `${weeklyCompletedEscrows > 0 ? '+' : ''}${weeklyCompletedEscrows}`,
            isPositive: weeklyCompletedEscrows >= 0
          }}
        />

        <StatCard
          title="Pending Escrows"
          value={pendingEscrows.toString()}
          description={`+${weeklyPendingEscrows} this week`}
          trend={{
            value: `${weeklyPendingEscrows > 0 ? '+' : ''}${weeklyPendingEscrows}`,
            isPositive: weeklyPendingEscrows >= 0
          }}
        />

        <StatCard
          title="Success Rate"
          value={`${totalEscrows > 0 ? Math.round((completedEscrows / totalEscrows) * 100) : 0}%`}
          description="Completed vs total"
          trend={{
            value: "High",
            isPositive: true
          }}
        />

        <StatCard
          title="Average Time"
          value="2.4 days"
          description="To complete escrow"
          trend={{
            value: "Fast",
            isPositive: true
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleNewEscrow} className="flex-1">
          <Plus className="mr-2 h-4 w-4" />
          Create New Escrow
        </Button>
        <Button 
          variant="outline" 
          onClick={() => handleWithdraw(true)}
          className="flex-1"
        >
          Withdraw Funds
        </Button>
      </div>

      {/* Security Info */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            </div>
            <div>
              <Typography variant="small" className="font-medium">
                Secured by ICP threshold ECDSA • No bridge
              </Typography>
              <Typography variant="muted" className="text-xs">
                Your funds are protected by advanced cryptographic security
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Modal */}
      <Withdraw open={isWithdrawOpen} onClose={() => handleWithdraw(false)} />
    </div>
  );
}
