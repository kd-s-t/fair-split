"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { TRANSACTION_STATUS_MAP } from "@/lib/constants";
import { formatBTC } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Bitcoin, Eye, UserRound, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import type { ActivityItem } from "@/modules/transactions/types";

interface ActivityContentProps {
  idx: number;
  activity: ActivityItem;
  category: string;
  txUrl?: string;
}

const ActivityContent = ({
  idx,
  activity,
  category,
  txUrl,
}: ActivityContentProps) => {

  const router = useRouter();

  const getTransactionStatusBadge = (status: string) => {
    const variant = (TRANSACTION_STATUS_MAP[status]?.variant ?? "confirmed") as
      | "secondary"
      | "success"
      | "primary"
      | "error"
      | "default"
      | "outline"
      | "warning";

    return (
      <Badge variant={variant}>
        {TRANSACTION_STATUS_MAP[status]?.label || status}
      </Badge>
    );
  };

  return (
    <Card key={idx} className="bg-[#212121] border-0 rounded-[20px] p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Typography
              variant="large"
              className="text-white text-xl font-semibold"
            >
              {activity.title || 'Untitled Transaction'}
            </Typography>
            {activity.status && getTransactionStatusBadge(activity.status)}
          </div>

          <div className="flex items-center gap-2 text-[#9F9F9F] text-sm">
            <span>
              {activity.createdAt ? new Date(Number(activity.createdAt) / 1_000_000).toLocaleString() : 'Unknown date'}
            </span>
            <span className="text-white">•</span>
            {category === "sent" ? (
              <div className="flex items-center gap-1 text-[#007AFF]">
                <ArrowUpRight size={18} />
                <span>Sent</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[#00C287]">
                <ArrowDownLeft size={18} />
                <span>Receiving</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action button - show for all transactions except withdrawal complete */}
        {txUrl && activity.status !== "withdraw_complete" && (
          <div className="flex gap-2">
            {activity.status === "released" || activity.status === "completed" ? (
              <Button
                variant="outline"
                size="sm"
                className="border-[#7A7A7A] text-white hover:bg-[#2a2a2a] h-10"
                onClick={() => router.push(txUrl)}
              >
                <Eye className="mr-2" size={16} /> View escrow
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="border-[#7A7A7A] text-white hover:bg-[#2a2a2a] h-10"
                onClick={() => router.push(txUrl)}
              >
                <UserRound className="mr-2" size={16} /> Manage escrow
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Recipients Section */}
      {activity.to &&
        Array.isArray(activity.to) &&
        activity.to.length > 0 && (
          <div className="space-y-4">

            {category === "sent" && (
              <Fragment>
                {activity.status === "released" || activity.status === "completed" ? (
                  // Completed sent transaction - simplified layout
                  <Fragment>
                    <div className="flex items-center gap-3">
                      <UsersRound size={20} className="text-white" />
                      <span className="text-white font-medium">Recipients ({activity.to?.length || 0})</span>
                    </div>
                    <Card className="bg-[#362825] border border-[#715A24] rounded-[10px] p-4 flex justify-between items-center">
                      <span className="text-white">Total escrow:</span>
                      <div className="flex items-center gap-2">
                        <Bitcoin size={20} className="text-[#F9A214]" />
                        <span className="text-white font-medium">
                          {formatBTC(
                            activity.to?.reduce(
                              (sum: number, recipient) =>
                                sum + (recipient.amount ? Number(recipient.amount) : 0),
                              0
                            ) || 0
                          )}
                        </span>
                        <span className="text-[#9F9F9F] text-sm">BTC</span>
                      </div>
                    </Card>
                  </Fragment>
                ) : (
                  // Active/pending sent transaction - full layout with recipients table
                  <Fragment>
                    {/* Recipients Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <UsersRound size={20} className="text-white" />
                        <span className="text-white font-medium">Recipients ({activity.to?.length || 0})</span>
                      </div>

                      {/* Recipients Table */}
                      <div className="border border-[#424444] rounded-[10px] overflow-hidden">
                        {activity.to?.map((recipient, idx: number) => (
                          <div
                            key={idx}
                            className={`flex justify-between items-center p-4 text-white ${
                              idx % 2 === 0 ? 'bg-[#2B2B2B]' : 'bg-[#2B2B2B]'
                            } ${idx !== (activity.to?.length || 0) - 1 ? 'border-b border-[#424444]' : ''}`}
                          >
                            <span className="font-mono text-sm">
                              {String(recipient.principal).slice(0, 20)}...{String(recipient.principal).slice(-8)}
                            </span>
                            <span className="text-sm">
                              {recipient.percentage ? String(recipient.percentage) + "%" : ""} • {" "}
                              {recipient.amount ? formatBTC(Number(recipient.amount)) : "0"} BTC
                            </span>
                          </div>
                        ))}
                      </div>



                      {/* Total Escrow Section */}
                      <Card className="bg-[#362825] border border-[#715A24] rounded-[10px] p-4 flex justify-between items-center">
                        <span className="text-white">Total escrow:</span>
                        <div className="flex items-center gap-2">
                          <Bitcoin size={20} className="text-[#F9A214]" />
                          <span className="text-white font-medium">
                            {formatBTC(
                              activity.to?.reduce(
                                (sum: number, recipient) =>
                                  sum + (recipient.amount ? Number(recipient.amount) : 0),
                                0
                              ) || 0
                            )}
                          </span>
                          <span className="text-[#9F9F9F] text-sm">BTC</span>
                        </div>
                      </Card>
                    </div>
                  </Fragment>
                )}
              </Fragment>
            )}

            {category === "received" && (
              <Fragment>
                {activity.status === "released" || activity.status === "completed" ? (
                  // Completed received transaction - simplified layout
                  <Fragment>
                    <div className="flex items-center gap-3">
                      <UserRound size={20} className="text-white" />
                      <span className="text-white font-medium">Sender: {String(activity.from).slice(0, 20)}...{String(activity.from).slice(-8)}</span>
                    </div>
                    <Card className="bg-[#1B2E25] border border-[#2A6239] rounded-[10px] p-4">
                      <div className="space-y-2">
                        <span className="text-white text-sm">You&apos;ll receive:</span>
                        <div className="flex items-center gap-2">
                          <Bitcoin size={20} className="text-[#F9A214]" />
                          <span className="text-white font-medium">
                            {formatBTC(
                              (activity.to ? activity.to.reduce(
                                (sum: number, recipient) =>
                                  sum + Number(recipient.amount),
                                0
                              ) : 0)
                            )}
                          </span>
                          <span className="text-[#9F9F9F] text-sm">BTC</span>
                          <span className="text-white text-sm">(100%)</span>
                        </div>
                      </div>
                    </Card>
                  </Fragment>
                ) : (
                  // Active/pending received transaction - standard layout
                  <Fragment>
                    <div className="flex items-center gap-3">
                      <UserRound size={20} className="text-white" />
                      <span className="text-white font-medium">Sender: {String(activity.from).slice(0, 20)}...{String(activity.from).slice(-8)}</span>
                    </div>
                    <Card className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
                      <div className="flex items-center gap-2">
                        <Bitcoin size={20} className="text-[#F9A214]" />
                        <span className="text-white font-medium">
                          {formatBTC(
                            activity.to?.reduce(
                              (sum: number, recipient) =>
                                sum + Number(recipient.amount),
                              0
                            ) || 0
                          )}
                        </span>
                        <span className="text-[#9F9F9F] text-sm">BTC</span>
                        <span className="text-[#9F9F9F] text-sm">(100%)</span>
                      </div>
                    </Card>
                  </Fragment>
                )}
              </Fragment>
            )}
          </div>
        )
      }
    </Card>
  )
}

export default ActivityContent;