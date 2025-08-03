import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { TRANSACTION_STATUS_MAP } from "@/lib/constants";
import { formatBTC } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Bitcoin, Eye, UserRound, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment } from "react";

interface ActivityContentProps {
  idx: number;
  activity: any;
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
    <Card key={idx}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex justify-between flex-1">
          <div className="flex gap-2">
            <div>
              <div className="flex gap-2">
                <Typography
                  variant="large"
                  className="font-semibold leading-none"
                >
                  {activity.title || activity.description}
                </Typography>
                {getTransactionStatusBadge(activity.status)}
              </div>

              <div className="flex items-center gap-2">
                <Typography
                  variant="muted"
                  className="text-xs text[rgba(159, 159, 159, 1)]"
                >
                  {activity.date ||
                    (activity.timestamp && !isNaN(Number(activity.timestamp))
                      ? new Date(Number(activity.timestamp) * 1000).toLocaleString()
                      : new Date().toLocaleString())}
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
        {/* View escrow button/link */}
        {txUrl && (
          <div className="flex justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              className="border-[#7A7A7A]"
              onClick={() => router.push(txUrl)}
            >
              <Eye className="mr-2" /> View escrow
            </Button>
          </div>
        )}
      </div>

      {/* Recipients List and Total Escrow logic remains unchanged */}
      {activity.to &&
        Array.isArray(activity.to) &&
        activity.to.length > 0 && (
          <div className="mt-4 bg-[#232323] rounded-xl">

            {category === "sent" && (
              <Fragment>
                <div className="flex items-center gap-2 py-2 font-semibold text-white">
                  <UsersRound size={18} /> Recipients (
                  {activity.to.length})
                </div>

                <div className="container !p-0">
                  {activity.to.map((recipient: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center border-b border-[#333] p-3 last:border-b-0 text-white"
                    >
                      <span className="font-mono text-sm">
                        {recipient.principal}
                      </span>
                      <span className="text-xs text-[#bdbdbd]">
                        {recipient.percent ? recipient.percent + "%" : ""} •{" "}
                        {formatBTC(recipient.amount)} BTC
                      </span>
                    </div>
                  ))}
                </div>
                <div className="container-error flex justify-between items-center mt-2">
                  <Typography variant="small" className="text-[#FEB64D]">
                    Total escrow:
                  </Typography>
                  <Typography variant="small" className="text-[#FEB64D] gap-1 flex items-center">
                    <Bitcoin size={16} />
                    {formatBTC(
                      activity.to.reduce(
                        (sum: number, recipient: any) =>
                          sum + Number(recipient.amount),
                        0
                      )
                    )}
                    BTC
                  </Typography>
                </div>
              </Fragment>
            )}

            {category === "received" && (
              <Fragment>
                <div className="flex items-center gap-2 py-2 font-semibold text-white">
                  <UserRound size={18} /> Sender:
                  <Typography variant="muted">{activity.from}</Typography>
                </div>
                <div className="container-success mt-2">
                  <Typography variant="small">
                    You’ll receive:
                  </Typography>
                  <div className="flex items-center gap-2">
                    <Bitcoin size={16} />
                    <Typography>
                      {formatBTC(
                        activity.to.reduce(
                          (sum: number, recipient: any) =>
                            sum + Number(recipient.amount),
                          0
                        )
                      )}
                      BTC
                    </Typography>
                    <Typography variant="small" className="text-[rgba(159, 159, 159, 1)]">
                      (100%)
                    </Typography>
                  </div>
                </div>
              </Fragment>
            )}
          </div>
        )
      }
    </Card >
  )
}

export default ActivityContent;