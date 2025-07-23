import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Shield, Zap, CircleCheck, Clock8, Plus, Eye } from 'lucide-react';
import { useAppSelector } from '@/lib/redux/store';
import type { RootState } from '@/lib/redux/store';

interface DashboardStatsProps {
  portfolioBalance: string;
  usdValue: string;
  stats: {
    total: number;
    active: number;
    completed: number;
    pending: number;
  };
  onNewEscrow?: () => void;
}

export const DashboardStats: React.FC = () => {
  const btcBalance = useAppSelector((state: any) => state.user.btcBalance);
  const isLoading = btcBalance === null || btcBalance === undefined || btcBalance === '';
  return (
    <React.Fragment>  
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            
            <div className="flex items-center gap-2">
              <Typography variant='small'>Portfolio balance</Typography> 
              <Eye />
            </div>

            <Typography variant='h2' className="font-semibold">
              {isLoading ? (
                <span className="inline-block w-32 h-7 bg-gray-200 animate-pulse rounded" />
              ) : (
                `${btcBalance} BTC`
              )}
            </Typography>

            <div className="flex items-center gap-3">
              <Typography variant='muted'>$438,730.15</Typography>
              <Badge variant="default" className="text-[#00E19C] !font-normal text-xs">
                24H
              </Badge>
            </div>
          </div>
          <Button variant="default" className="font-medium rounded-md bg-[#FEB64D] text-[#0D0D0D]">
            <Plus className='text-xs mr-2'/> New escrow
          </Button>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total escrows" value={24} icon={<Shield className="text-yellow-400 text-2xl" />} />
        <StatCard label="Active escrows" value={6} icon={<Zap className="text-blue-400 text-2xl" />} />
        <StatCard label="Completed escrows" value={17} icon={<CircleCheck className="text-green-400 text-2xl" />} />
        <StatCard label="Pending escrows" value={1} icon={<Clock8 className="text-gray-400 text-2xl" />} />
      </div>
      </React.Fragment>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => (
  <Card className="flex flex-col gap-6">
    <div className="flex items-center gap-2 mb-2 justify-between">
        <Typography variant='h3' className="font-semibold">{value}</Typography>
        <span>{icon}</span>
    </div>
    <Typography variant='muted'>{label}</Typography>
  </Card>
);

export default DashboardStats;