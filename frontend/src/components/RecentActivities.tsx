import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { UsersRound, Bitcoin, ChevronRight, Clock8, ArrowUpRight, ArrowDownLeft, Eye, Wallet, UserRound } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { truncateAddress } from '@/helper/string_helpper';

const mockActivities = [
    {
      "description": "Freelance project payment",
      "status": "active",
      "date": "Jul 15, 06:30 PM",
      "category": "sent",
      "recipients": [
        {
          "walletAddress": "0xA1B2C3D4E5F6",
          "amount": 0.00300000,
          "percentage": 60
        },
        {
          "walletAddress": "0xB2C3D4E5F6A1",
          "amount": 0.00200000,
          "percentage": 40
        }
      ]
    },
    {
      "description": "NFT collab - July share",
      "status": "completed",
      "date": "Jul 12, 07:29 PM",
      "category": "received",
      "recipients": [
        {
          "walletAddress": "0xD4E5F6A1B2C3",
          "amount": 0.00200000,
          "percentage": 50
        }
      ]
    },
    {
      "description": "Smart Contract Audit",
      "status": "pending",
      "date": "Jul 12, 11:45 PM",
      "category": "sent",
      "recipients": [
        {
          "walletAddress": "0xF6A1B2C3D4E5",
          "amount": 0.01600000,
          "percentage": 30
        },
        {
          "walletAddress": "0xA1B2C3D4E5F7",
          "amount": 0.02400000,
          "percentage": 40
        },
        {
          "walletAddress": "0xB2C3D4E5F6A2",
          "amount": 0.02000000,
          "percentage": 30
        }
      ]
    },
    {
        "description": "Product sale",
        "status": "refunded",
        "date": "Jul 10, 05:15 PM",
        "category": "received",
        "recipients": [
          {
            "walletAddress": "0xF6A1B2C3D4E5",
            "amount": 1.25000000,
            "percentage": 100
          },
        ]
      }
  ]


const statusMap: Record<string, { label: string; variant: string }> = {
  active: { label: 'Active', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'success' },
  pending: { label: 'Pending', variant: 'primary' },
  refunded: { label: 'Refunded', variant: 'error' },
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
                <TabsTrigger value="all" className="text-muted-foreground font-medium">All transactions (5)</TabsTrigger>
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
                            <div>
                                <div className="flex gap-2">
                                    <Typography variant="h4" className="font-semibold leading-none">
                                        {activity.description}
                                    </Typography>

                                    <Badge variant={statusMap[activity.status].variant} className="text-xs">
                                        {statusMap[activity.status]?.label || activity.status}
                                    </Badge>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Typography variant="muted" className="text-xs">
                                        Jul 15, 06:30 PM 
                                    </Typography> 
                                    <span className='text-white'>•</span>
                                    {(activity.category === 'sent' || activity.category === 'pending') ? (
                                        <div className='flex items-center gap-1 text-[#007AFF]'>
                                            <ArrowUpRight size={14}/> 
                                            <Typography variant="muted" className='!text-[#007AFF]'>Sent</Typography>
                                        </div>
                                        
                                    ) : <div className='flex items-center gap-1 text-[#00C287]'>
                                        <ArrowDownLeft size={14}/> 
                                        <Typography variant="muted" className='!text-[#00C287]'>Receiving</Typography>
                                </div>}
                                </div>
                            </div>
                        </div>

                        {activity.category === 'sent' && (
                            <Button variant="outline" size="sm" className="font-medium border-[#7A7A7A]">
                                <Wallet className='mr-2' /> Manage escrow 
                            </Button>
                        )}

                        {activity.category === 'received' && (
                            <Button variant="outline" size="sm" className="font-medium border-[#7A7A7A]">
                                <Eye className='mr-2'/> View escrow
                            </Button>
                        )}
                    </div>
                </div>
                    {activity.category === 'sent' && (
                        <>
                    <div className="flex items-center gap-2 mb-2 mt-5">
                        <UsersRound size={16} />  
                        <Typography variant="base">
                            Recipients ({activity.recipients.length})
                        </Typography>
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
                    <div className='container-error mt-4'>
                        <div className='flex items-center justify-between'>
                            <Typography variant="muted">Total escrow:</Typography>
                            <div className='flex items-center gap-2'>
                                <Bitcoin size={16} color='#F97415' />
                                <Typography variant="muted">
                                    0.08000000 BTC
                                </Typography>
                            </div>
                        </div>
                    </div>
                    </>
                    )}

                    {activity.category === 'received' && (
                        <>
                    <div className="flex items-center gap-2 mb-2 mt-5">
                        <UserRound size={16} />  
                        <div className="flex gap-2">
                            <Typography variant="base">
                                Sender: 
                            </Typography>
                            <Typography variant="muted">
                                {truncateAddress(activity.recipients[0].walletAddress)}
                            </Typography>
                        </div>
                    </div>
                    <div className='container-success mt-4'>
                        <Typography variant="small">You’ll receive:</Typography>
                        <div className='flex items-center gap-2'>
                            <Bitcoin size={16} color='#F97415' />
                            <Typography variant="base">
                                0.08000000 BTC
                            </Typography>
                            <Typography variant="small">
                                (100%)
                            </Typography>
                        </div>
                    </div>
                    </>
                    )}
                </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
