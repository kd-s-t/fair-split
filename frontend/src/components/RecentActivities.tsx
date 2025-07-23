import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { UsersRound, Bitcoin, ChevronRight, Clock8 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { truncateAddress } from '@/helper/string_helpper';

const mockActivities = [
    {
      "description": "Dinner split at Italian Bistro",
      "status": "completed",
      "transferAmount": 120.00,
      "recipients": [
        {
          "walletAddress": "0xA1B2C3D4E5F6",
          "amount": 40.00,
          "percentage": 33.33
        },
        {
          "walletAddress": "0xB2C3D4E5F6A1",
          "amount": 40.00,
          "percentage": 33.33
        },
        {
          "walletAddress": "0xC3D4E5F6A1B2",
          "amount": 40.00,
          "percentage": 33.33
        }
      ]
    },
    {
      "description": "Cab fare to airport",
      "status": "active",
      "transferAmount": 60.00,
      "recipients": [
        {
          "walletAddress": "0xD4E5F6A1B2C3",
          "amount": 30.00,
          "percentage": 50.00
        },
        {
          "walletAddress": "0xE5F6A1B2C3D4",
          "amount": 30.00,
          "percentage": 50.00
        }
      ]
    },
    {
      "description": "Concert tickets group buy",
      "status": "completed",
      "transferAmount": 300.00,
      "recipients": [
        {
          "walletAddress": "0xF6A1B2C3D4E5",
          "amount": 100.00,
          "percentage": 33.33
        },
        {
          "walletAddress": "0xA1B2C3D4E5F7",
          "amount": 100.00,
          "percentage": 33.33
        },
        {
          "walletAddress": "0xB2C3D4E5F6A2",
          "amount": 100.00,
          "percentage": 33.33
        }
      ]
    }
  ]



const statusMap: Record<string, { label: string; variant: string }> = {
  active: { label: 'Active', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'success' },
  pending: { label: 'Completed', variant: 'success' },
  refunded: { label: 'Completed', variant: 'success' },
};



export default function RecentActivities() {

  return (
    <div className="mt-10">
      <Typography variant="h3" className="font-semibold">Recent activity</Typography>
      <Typography variant="muted" className="text-gray-400 font-normal">
        Track your latest escrow transactions
      </Typography>

      <Tabs defaultValue="all" className="mt-4">
        <div className="flex items-center justify-between">
            <TabsList>
                <TabsTrigger value="all" className="text-muted-foreground font-medium">All Transactions (5)</TabsTrigger>
                <TabsTrigger value="active" className="text-muted-foreground font-medium">Send (3)</TabsTrigger>
                <TabsTrigger value="completed" className="text-muted-foreground font-medium">Received (2)</TabsTrigger>
            </TabsList>
            <Button variant="ghost" className="font-medium">View all transactions <ChevronRight /></Button>
        </div>

        <TabsContent value="all" className="flex flex-col gap-6 mt-6">
            {mockActivities.map((activity, idx) => (
            <Card key={idx}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex justify-between flex-1">
                    <div className="flex gap-2">
                        <Clock8 size={16} />
                        <div>
                            <div className="flex gap-2">
                                <Typography variant="h4" className="font-semibold leading-none">
                                    {activity.description}
                                </Typography>
                                <Badge variant={statusMap[activity.status].variant as 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | undefined} className="text-xs">
                                    {statusMap[activity.status]?.label || activity.status}
                                </Badge>
                            </div>
                            <Typography variant="muted" className="text-xs mt-2">Jul 15, 06:30 PM</Typography>
                        </div>
                    </div>
                    {activity.status === 'active' && (
                        <Button variant="default" size="sm" className="font-medium bg-primary">
                            Manage escrow <ChevronRight />  
                        </Button>
                    )}

                    {activity.status === 'completed' && (
                        <Button variant="outline" size="sm" className="font-medium">
                            View escrow <ChevronRight />  
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 mb-2 mt-5">
                <UsersRound size={16} className="mr-1" />  
                <Typography variant="large">
                    Recipients ({activity.recipients.length})
                </Typography>
                <div className="ml-auto flex items-center gap-1">
                    <Bitcoin />
                    <Typography variant="large" className="font-semibold">{activity.transferAmount.toFixed(8)}</Typography>
                </div>
            </div>
            <div className="rounded-lg overflow-hidden border border-[#424444]">
                {activity.recipients.map((r, i) => (
                <div
                    key={i}
                    className={`flex items-center px-4 py-3 text-sm font-normal ${i !== activity.recipients.length - 1 ? 'border-b border-[#35363a]' : ''}`}
                >
                    <span className="flex-1 text-ellipsis overflow-hidden">
                        {truncateAddress(r.walletAddress)}
                    </span>
                    <span className="text-muted-foreground mr-4">
                        {r.percentage}% • {r.amount.toFixed(8)} BTC
                    </span>
                </div>
                ))}
            </div>
            </Card>
        ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
