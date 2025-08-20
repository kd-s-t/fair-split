"use client";

import { Copy, Shield, Bitcoin, Users, Zap } from "lucide-react";
import { Typography } from "@/components/ui/typography";

import { RefundedEscrowDetailsProps } from "./types";
import RecipientsList from "./RecipientsList";
import TransactionExplorerLinks from "./TransactionExplorerLinks";
import { useMemo } from "react";

export default function RefundedEscrowDetails({ transaction }: RefundedEscrowDetailsProps) {
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
    <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-6">

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total BTC Widget */}
        <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4 flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Bitcoin size={24} className="text-[#FEB64D]" />
          </div>
          <div className="text-center">
            <Typography variant="small" className="text-[#9F9F9F]">Total BTC</Typography>
            <Typography variant="base" className="text-white font-semibold mt-2">
              {totalBTC.toFixed(8)} BTC
            </Typography>
          </div>
        </div>

        {/* Recipients Widget */}
        <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4 flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Users size={24} className="text-[#FEB64D]" />
          </div>
          <div className="text-center">
            <Typography variant="small" className="text-[#9F9F9F]">Recipients</Typography>
            <Typography variant="base" className="text-white font-semibold mt-2">
              {recipientCount}
            </Typography>
          </div>
        </div>

        {/* Status Widget */}
        <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4 flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Zap size={24} className="text-[#FEB64D]" />
          </div>
          <div className="text-center">
            <Typography variant="small" className="text-[#9F9F9F]">Status</Typography>
            <Typography variant="base" className="text-[#F64C4C] font-semibold mt-2">
              Refunded
            </Typography>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-[#424444] h-[1px]" />

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
    </div>
  );
} 