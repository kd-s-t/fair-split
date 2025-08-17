"use client";

import { Copy, Shield } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import TransactionStats from "@/components/TransactionStats";

import { CancelledEscrowDetailsProps } from "./types";
import RecipientsList from "./RecipientsList";
import TransactionExplorerLinks from "./TransactionExplorerLinks";
import { useMemo } from "react";

export default function CancelledEscrowDetails({ transaction }: CancelledEscrowDetailsProps) {
  const depositAddress = useMemo(() => {
    return ('bitcoinAddress' in transaction ? transaction.bitcoinAddress : undefined) ||
      ('depositAddress' in transaction ? transaction.depositAddress : undefined) ||
      "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  }, [transaction]);

  const totalBTC =
    Array.isArray(transaction?.to) && transaction.to.length > 0
      ? transaction.to.reduce((sum, toEntry) => sum + Number(toEntry.amount), 0) / 1e8
      : 0;

  const recipientCount = transaction?.to?.length || 0;

  return (
    <div className="container !rounded-2xl !p-6">

      <Typography variant="large" className="mb-4">Escrow overview</Typography>

      <TransactionStats
        totalBTC={totalBTC}
        recipientCount={recipientCount}
        status={transaction.status}
      />

      <hr className="my-10 text-[#424444] h-[1px]" />

      <RecipientsList 
        recipients={
          'to' in transaction && Array.isArray(transaction.to) 
            ? transaction.to.map(recipient => ({
                ...recipient,
                amount: typeof recipient.amount === 'string' ? BigInt(recipient.amount) : recipient.amount,
                percentage: typeof recipient.percentage === 'string' ? Number(recipient.percentage) : recipient.percentage,
                status: recipient.status as { [key: string]: null }
              }))
            : []
        } 
        showTimestamps={false} 
      />

      <hr className="my-6 text-[#424444] h-[1px]" />

      <Typography variant="large" className="text-[#F64C4C]">Escrow Cancelled</Typography>

      <Typography variant="small" className="text-[#fff] font-semibold">
        Bitcoin deposit address
      </Typography>
      <div className="grid grid-cols-12 gap-3 mt-2">
        <div className="container-gray col-span-11 break-all">
          {depositAddress}
        </div>
        <div className="container-gray cursor-pointer">
          <Copy />
        </div>
      </div>

      <div className="container-primary mt-4">
        <Typography variant="p" className="text-[#F64C4C] font-semibold">
          This escrow has been cancelled and refunded
        </Typography>
        <Typography variant="p" className="text-white">
          The sender has been refunded for the cancelled escrow
        </Typography>
      </div>

      <TransactionExplorerLinks transaction={transaction} depositAddress={depositAddress} />

      <div className="container-gray mt-6">
        <div className="flex items-start gap-3">
          <span className="bg-[#4F3F27] p-2 rounded-full">
            <Shield color="#FEB64D" />
          </span>
          <div>
            <Typography variant="base" className="text-white font-semibold">
              Fully Trustless
            </Typography>
            <Typography className="text-[#9F9F9F] mt-1">
              Escrow powered by Internet Computer&apos;s native Bitcoin integration.
              No bridge. No wrap. Fully trustless.
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
} 