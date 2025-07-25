import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import {
  UsersRound,
  Bitcoin,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Wallet,
  UserRound,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { truncateAddress } from "@/helper/string_helpper";
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/redux/store';
import { useRouter } from 'next/navigation';

const mockActivities = [
  {
    description: "Freelance project payment",
    status: "active",
    date: "Jul 15, 06:30 PM",
    category: "sent",
    recipients: [
      {
        walletAddress: "0xA1B2C3D4E5F6",
        amount: 0.003,
        percentage: 60,
      },
      {
        walletAddress: "0xB2C3D4E5F6A1",
        amount: 0.002,
        percentage: 40,
      },
    ],
  },
  {
    description: "NFT collab - July share",
    status: "completed",
    date: "Jul 12, 07:29 PM",
    category: "received",
    recipients: [
      {
        walletAddress: "0xD4E5F6A1B2C3",
        amount: 0.002,
        percentage: 50,
      },
    ],
  },
  {
    description: "Smart Contract Audit",
    status: "pending",
    date: "Jul 12, 11:45 PM",
    category: "sent",
    recipients: [
      {
        walletAddress: "0xF6A1B2C3D4E5",
        amount: 0.016,
        percentage: 30,
      },
      {
        walletAddress: "0xA1B2C3D4E5F7",
        amount: 0.024,
        percentage: 40,
      },
      {
        walletAddress: "0xB2C3D4E5F6A2",
        amount: 0.02,
        percentage: 30,
      },
    ],
  },
  {
    description: "Product sale",
    status: "refunded",
    date: "Jul 10, 05:15 PM",
    category: "received",
    recipients: [
      {
        walletAddress: "0xF6A1B2C3D4E5",
        amount: 1.25,
        percentage: 100,
      },
    ],
  },
];

export const statusMap: Record<string, { label: string; variant: string }> = {
  released: { label: "Completed", variant: "success" },
  draft: { label: "Draft", variant: "secondary" },
  pending: { label: "Pending", variant: "primary" },
  confirmed: { label: "Confirmed", variant: "primary" },
  cancelled: { label: "Cancelled", variant: "error" },
  declined: { label: "Declined", variant: "error" },
  refund: { label: "Refunded", variant: "error" },
  active: { label: "Active", variant: "secondary" },
  completed: { label: "Completed", variant: "success" },
};

interface RecentActivitiesProps {
  transactions?: any[];
}

export default function RecentActivities({ transactions }: RecentActivitiesProps) {
  const router = useRouter();
  const principal = useSelector((state: RootState) => state.user?.principal);
  const activities = transactions && transactions.length > 0 ? transactions : mockActivities;
  return (
    <div className="mt-10">
      <Typography variant="h3" className="font-semibold">
        Recent activity
      </Typography>
      <Typography variant="muted" className="text-gray-400 font-normal">
        Track your latest escrow transactions
      </Typography>

      <Tabs defaultValue="all" className="mt-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger
              value="all"
              className="text-muted-foreground font-medium"
            >
              All transactions ({activities.length})
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="text-muted-foreground font-medium"
            >
              Send (0)
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-muted-foreground font-medium"
            >
              Received (0)
            </TabsTrigger>
          </TabsList>
          <Button variant="ghost" className="font-medium" onClick={() => window.location.href = '/transactions'}>
            View all transactions <ChevronRight />
          </Button>
        </div>

        <TabsContent value="all" className="flex flex-col gap-6 mt-6">
          {activities.map((activity: any, idx: number) => {
            const isSender = principal && activity.from && String(activity.from) === String(principal);
            const category = isSender ? 'sent' : 'received';
            // Build transaction details URL
            const txUrl = activity.from ? `/transactions/${idx}-${activity.from}` : undefined;
            return (
              <Card key={idx}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex justify-between flex-1">
                    <div className="flex gap-2">
                      <div>
                        <div className="flex gap-2">
                          <Typography
                            variant="h4"
                            className="font-semibold leading-none"
                          >
                            {activity.title || activity.description}
                          </Typography>
                          <div className="text-xs text-gray-400 mt-1">
                            {activity.date || (activity.timestamp ? new Date(Number(activity.timestamp) / 1_000_000).toLocaleString() : '')}
                          </div>
                          {(() => {
                            const statusKey = typeof activity.status === 'object' && activity.status !== null
                              ? Object.keys(activity.status)[0]
                              : activity.status;
                            let label = '';
                            let badgeClass = '';
                            if (statusKey === 'released') {
                              label = 'Completed';
                              badgeClass = 'bg-green-500 text-white';
                            } else if (statusKey === 'pending') {
                              label = 'Pending';
                              badgeClass = 'bg-yellow-400 text-black';
                            } else if (["refund", "cancelled", "declined"].includes(statusKey)) {
                              label = 'Refunded';
                              badgeClass = 'bg-red-500 text-white';
                            } else {
                              label = 'Active';
                              badgeClass = 'bg-blue-600 text-white';
                            }
                            return (
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ml-2 ${badgeClass}`}>{label}</span>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Typography variant="muted" className="text-xs">
                            {activity.date || ''}
                          </Typography>
                          <span className="text-white">•</span>
                          {category === "sent" ? (
                            <div className="flex items-center gap-1 text-[#007AFF]">
                              <ArrowUpRight size={14} />
                              <Typography
                                variant="muted"
                                className="!text-[#007AFF]"
                              >
                                Sent
                              </Typography>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[#00C287]">
                              <ArrowDownLeft size={14} />
                              <Typography
                                variant="muted"
                                className="!text-[#00C287]"
                              >
                                Receiving
                              </Typography>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* View escrow button/link */}
                {txUrl && (
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-medium border-[#7A7A7A]"
                      onClick={() => router.push(txUrl)}
                    >
                      <Eye className="mr-2" /> View escrow
                    </Button>
                  </div>
                )}
                {/* Recipients List and Total Escrow logic remains unchanged */}
                {activity.to && Array.isArray(activity.to) && activity.to.length > 0 && (
                  <div className="mt-4 bg-[#232323] rounded-xl">
                    <div className="flex items-center gap-2 px-4 py-2 font-semibold text-white">
                      <UsersRound size={18} /> Recipients ({activity.to.length})
                    </div>
                    {activity.to.map((recipient: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center px-4 py-2 border-b border-[#333] last:border-b-0 text-white">
                        <span className="font-mono text-sm">{recipient.principal}</span>
                        <span className="text-xs text-[#bdbdbd]">{recipient.percent ? recipient.percent + '%' : ''} • {(Number(recipient.amount) / 1e8).toFixed(8)} BTC</span>
                      </div>
                    ))}
                    {/* Total escrow */}
                    <div className="flex justify-between items-center px-4 py-3 bg-[#3a2921] rounded-b-xl mt-2">
                      <span className="font-semibold text-[#FEB64D]">Total escrow:</span>
                      <span className="font-mono text-[#FEB64D] flex items-center gap-1">
                        <Bitcoin size={16} />
                        {(
                          activity.to.reduce((sum: number, recipient: any) => sum + Number(recipient.amount), 0) / 1e8
                        ).toFixed(8)} BTC
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
