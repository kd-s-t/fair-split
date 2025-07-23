import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { useAppSelector } from "@/lib/redux/store";
import { CircleCheck, Clock8, Eye, Plus, Shield, Zap } from "lucide-react";
import React from "react";

export const DashboardStats: React.FC = () => {
  const btcBalance = useAppSelector((state: any) => state.user.btcBalance);
  const isLoading =
    btcBalance === null || btcBalance === undefined || btcBalance === "";
  return (
    <React.Fragment>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Typography variant="small">Portfolio balance</Typography>
            <Eye size={16} />
          </div>

          <Typography variant="h2" className="font-semibold">
            {isLoading ? (
              <span className="inline-block w-32 h-7 bg-gray-200 animate-pulse rounded" />
            ) : (
              `${btcBalance} BTC`
            )}
          </Typography>

          <div className="flex items-center gap-3">
            <Typography variant="muted">$438,730.15</Typography>
            <Badge
              variant="default"
              className="text-[#00E19C] !font-normal text-xs"
            >
              24H
            </Badge>
          </div>
        </div>
        <Button
          variant="default"
          className="font-medium rounded-md bg-[#FEB64D] text-[#0D0D0D]"
        >
          <Plus className="text-xs mr-2" /> New escrow
        </Button>
      </div>

      <div className="container w-full shadow-sm flex items-center gap-2 mt-6">
        <Shield color="#FEB64D" />{" "}
        <Typography variant="muted" className="font-medium">
          Secured by ICP threshold ECDSA • No bridges, no wrapped BTC
        </Typography>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard
          label="Total escrows"
          value={24}
          icon={<Shield className="text-yellow-400 text-2xl" />}
        />
        <StatCard
          label="Active escrows"
          value={6}
          icon={<Zap className="text-blue-400 text-2xl" />}
        />
        <StatCard
          label="Completed escrows"
          value={17}
          icon={<CircleCheck className="text-green-400 text-2xl" />}
        />
        <StatCard
          label="Pending escrows"
          value={1}
          icon={<Clock8 className="text-gray-400 text-2xl" />}
        />
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

export default DashboardStats;
