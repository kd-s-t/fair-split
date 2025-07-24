import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { truncateAddress } from "@/helper/string_helpper";
import type { Transaction } from '@/declarations/split_dapp/split_dapp.did'
import { Typography } from '@/components/ui/typography'

function btcToUsd(btc: number) {
  const rate = 60000; // 1 BTC = $60,000 (example rate)
  return btc * rate;
}

export default function RecentActivities({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="mt-10">
      <Typography variant="h3" className="font-semibold">Recent activity</Typography>
      <Typography variant="muted" className="text-gray-400 font-normal">
        Track your latest escrow transactions
      </Typography>

      <Tabs defaultValue="all" className="mt-4">
        <div className="flex items-center justify-between">
            <TabsList>
                <TabsTrigger value="all" className="text-muted-foreground font-medium">All Transactions ({transactions.length})</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value="all" className="flex flex-col gap-6 mt-6">
          {transactions.map((activity, idx) => (
            <div key={idx} className="rounded-xl border bg-[#222222] border-[#303434] shadow-sm p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-1">
                  <Typography variant="muted" className="text-xs">
                    {activity.title}
                  </Typography>
                  <Typography variant="muted" className="text-xs">
                    {Object.keys(activity.status)[0]}
                  </Typography>
                </div>
                <div className="flex flex-col items-end">
                  <Typography variant="h4" className="font-semibold">
                    {activity.to.reduce((sum, toEntry) => sum + Number(toEntry.amount), 0) / 1e8} BTC
                  </Typography>
                  <Typography variant="muted">
                    ${btcToUsd(activity.to.reduce((sum, toEntry) => sum + Number(toEntry.amount), 0) / 1e8).toLocaleString()}
                  </Typography>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Typography variant="muted" className="text-xs">
                  {new Date(Number(activity.timestamp) / 1_000_000).toLocaleString()}
                </Typography>
                <span className="text-white">•</span>
                <Typography variant="muted" className="text-xs">
                  From: {typeof activity.from === 'string' ? activity.from : ''}
                </Typography>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
