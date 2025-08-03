"use client";

import { Copy, Shield } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { TransactionStats } from "@/components/ui/transaction-stats";

import { RefundedEscrowDetailsProps } from "./types";
import RecipientsList from "./RecipientsList";
import TransactionExplorerLinks from "./TransactionExplorerLinks";

export default function RefundedEscrowDetails({ transaction }: RefundedEscrowDetailsProps) {
  const depositAddress = transaction?.depositAddress ||
    Array.from({ length: 42 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

  const totalBTC =
    Array.isArray(transaction?.to) && transaction.to.length > 0
      ? transaction.to.reduce((sum, toEntry) => sum + Number(toEntry.amount), 0) / 1e8
      : 0;

  const recipientCount = transaction?.to?.length || 0;

  return (
    <>
      <TransactionStats 
        totalBTC={totalBTC}
        recipientCount={recipientCount}
        status={transaction.status}
      />

      <hr className="my-10 text-[#424444] h-[1px]" />

      <RecipientsList recipients={transaction.to || []} showTimestamps={false} />

      <hr className="my-6 text-[#424444] h-[1px]" />

      <Typography variant="large" className="text-[#F64C4C]">Escrow Refunded</Typography>

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
          This escrow has been refunded
        </Typography>
        <Typography variant="p" className="text-white">
          The sender has been refunded for the confirmed escrow
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
    </>
  );
} 