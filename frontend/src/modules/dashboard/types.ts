import { EscrowTransaction } from '../transactions/types';

export interface RecentActivitiesProps {
  transactions?: EscrowTransaction[];
}

export interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

export interface DashboardStatsProps {
  transactions: EscrowTransaction[];
}
