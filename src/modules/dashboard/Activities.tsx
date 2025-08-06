"use client"

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import ActivityContent from "./ActivityContent";
import { useTransactions } from "@/hooks/useTransactions";
import { Typography } from "@/components/ui/typography";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import type { ActivityItem } from "@/modules/transactions/types";

export default function RecentActivities() {
  const principal = useSelector((state: RootState) => state.user?.principal);
  const { transactions } = useTransactions();

  const activities = transactions && transactions.length > 0
    ? [...transactions].sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    : [];

  const sentCount = activities.filter(
    (activity: ActivityItem) => principal && String(activity.from) === String(principal)
  ).length;

  const receivedCount = activities.filter(
    (activity: ActivityItem) => principal && activity.to && activity.to.some(
      (recipient: { principal: unknown }) => String(recipient.principal) === String(principal)
    )
  ).length;

  return (
    <div className="mt-10">
      <Typography variant="h3">
        Recent activity
      </Typography>
      <Typography variant="muted" className="text-gray-400">
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
          {activities.map((activity: ActivityItem, idx: number) => {
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
                key={idx}
                idx={idx}
                activity={activity}
                category={category}
                txUrl={txUrl}
              />
            );
          })}
        </TabsContent>

        <TabsContent value="active" className="flex flex-col gap-6 mt-6">
          {activities
            .filter((activity: ActivityItem) =>
              principal && String(activity.from) === String(principal)
            )
            .map((activity: ActivityItem, idx: number) => {
              // const isSender = true; // We know it's sent since we filtered
              const category = "sent";
              const txUrl = activity.id ? `/transactions/${activity.id}` : undefined;
              return (
                <ActivityContent
                  key={idx}
                  idx={idx}
                  activity={activity}
                  category={category}
                  txUrl={txUrl}
                />
              );
            })}
        </TabsContent>

        <TabsContent value="completed" className="flex flex-col gap-6 mt-6">
          {activities
            .filter((activity: ActivityItem) =>
              principal && activity.to && activity.to.some(
                (recipient: { principal: unknown }) => String(recipient.principal) === String(principal)
              )
            )
            .map((activity: ActivityItem, idx: number) => {
              // const isSender = false; // We know it's received since we filtered
              const category = "received";
              const txUrl = activity.id ? `/transactions/${activity.id}` : undefined;
              return (
                <ActivityContent
                  key={idx}
                  idx={idx}
                  activity={activity}
                  category={category}
                  txUrl={txUrl}
                />
              );
            })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
