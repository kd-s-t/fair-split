"use client"

import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import ActivityContent from "./ActivityContent";
import { useAuth } from "@/contexts/auth-context";
import { useTransactions } from "@/hooks/transactions";
import type { NormalizedTransaction } from "@/modules/transactions/types";

export default function RecentActivities() {
  const { principal } = useAuth();
  const { transactions } = useTransactions();

  // Convert transactions to activities format
  const activities: NormalizedTransaction[] = transactions || [];

  // Calculate counts
  const sentCount = activities.filter(
    (activity) => principal && String(activity.from) === String(principal)
  ).length;

  const receivedCount = activities.filter(
    (activity) =>
      principal &&
      activity.to &&
      activity.to.some(
        (recipient) => String(recipient.principal) === String(principal)
      )
  ).length;

  if (activities.length === 0) {
    return (
      <div className="container !rounded-2xl !p-6">
        <Typography variant="large" className="mb-2">
          Recent activities
        </Typography>
        <Typography variant="small" className="text-[#9F9F9F]">
          No transactions yet. Create your first escrow to get started.
        </Typography>
      </div>
    );
  }

  return (
    <div className="container !rounded-2xl !p-6">
      <Typography variant="large" className="mb-2">
        Recent activities
      </Typography>
      <Typography variant="small" className="text-[#9F9F9F]">
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
              Send ({sentCount})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-muted-foreground font-medium"
            >
              Received ({receivedCount})
            </TabsTrigger>
          </TabsList>
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/transactions")}
          >
            View all transactions <ChevronRight />
          </Button>
        </div>

        <TabsContent value="all" className="flex flex-col gap-6 mt-6">
          {activities.map((activity: NormalizedTransaction, idx: number) => {
            const isSender =
              principal &&
              activity.from &&
              String(activity.from) === String(principal);

            const category = isSender ? "sent" : "received";
            // Build transaction details URL
            const txUrl = activity.id
              ? `/transactions/${activity.id}`
              : undefined;

            return (
              <ActivityContent
                key={activity.id || idx}
                idx={idx}
                activity={activity}
                category={category}
                txUrl={txUrl}
              />
            );
          })
          }
        </TabsContent >

        <TabsContent value="active" className="flex flex-col gap-6 mt-6">
          {activities
            .filter((activity: NormalizedTransaction) =>
              principal && String(activity.from) === String(principal)
            )
            .map((activity, idx: number) => {
              const txUrl = activity.id ? `/transactions/${activity.id}` : undefined;
              return (
                <ActivityContent
                  key={activity.id || idx}
                  idx={idx}
                  activity={activity}
                  category="sent"
                  txUrl={txUrl}
                />
              );
            })}
        </TabsContent>

        <TabsContent value="completed" className="flex flex-col gap-6 mt-6">
          {activities
            .filter((activity: NormalizedTransaction) =>
              principal && activity.to && activity.to.some(
                (recipient) => String(recipient.principal) === String(principal)
              )
            )
            .map((activity, idx: number) => {
              const txUrl = activity.id ? `/transactions/${activity.id}` : undefined;
              return (
                <ActivityContent
                  key={activity.id || idx}
                  idx={idx}
                  activity={activity}
                  category="received"
                  txUrl={txUrl}
                />
              );
            })}
        </TabsContent>
      </Tabs >
    </div >
  );
}
