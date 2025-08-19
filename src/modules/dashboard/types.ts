import { NormalizedTransaction } from '../transactions/types';

export interface RecentActivitiesProps {
  transactions?: NormalizedTransaction[];
}

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  additionalInfo?: string;
}

export interface DashboardStatsProps {
  transactions: NormalizedTransaction[];
}
