"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, CalendarCheck2, Hash, CircleCheckBig, Bitcoin, Users, Zap } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { ReleasedEscrowDetailsProps } from "./types";
import TransactionExplorerLinks from "./TransactionExplorerLinks";

export default function ReleasedEscrowDetails({ transaction }: ReleasedEscrowDetailsProps) {
  // Calculate total released BTC
  const totalBTC = Array.isArray(transaction.to)
    ? transaction.to.reduce((sum: number, toEntry) => sum + Number(toEntry.amount), 0) / 1e8
    : 0;

  const recipientCount = transaction.to?.length || 0;

  // Use releasedAt if present, otherwise fallback to timestamp
  const releasedAt = transaction.releasedAt;
  const completedDate = releasedAt
    ? new Date(Number(releasedAt) / 1_000_000) // Convert nanoseconds to milliseconds
    : new Date(Number(transaction.createdAt) / 1_000_000);

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
            <Typography variant="base" className="text-[#1be37c] font-semibold mt-2">
              Released
            </Typography>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-[#424444] h-[1px]" />

      {/* Completion Details */}
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="flex items-center gap-3">
          <span className="bg-[#4F3F27] p-2 rounded-full">
            <CalendarCheck2 color="#FEB64D" />
          </span>
          <div>
            <Typography variant="small" className="text-[#9F9F9F]">Completed on</Typography>
            <Typography variant="base" className="text-white font-semibold">
              {releasedAt
                ? completedDate.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })
                : 'N/A'}
            </Typography>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-[#4F3F27] p-2 rounded-full">
            <Hash color="#FEB64D" />
          </span>
          <div>
            <Typography variant="small" className="text-[#9F9F9F]">Transaction</Typography>
            <Typography variant="base" className="text-white font-semibold">
              {transaction.bitcoinTransactionHash ? `${transaction.bitcoinTransactionHash.slice(0, 10)}...` : 'N/A'}
            </Typography>
          </div>
        </div>
      </div>
      <hr className="my-4 text-[#424444] h-[1px]" />
      {/* Payment distribution */}
      <Typography variant="large" className="mb-4">Payment distribution</Typography>
      <div className="flex flex-col gap-4">
        {Array.isArray(transaction.to) && transaction.to.map((toEntry, idx: number) => (
          <div key={idx} className="bg-[#232323] border border-[#393939] rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-[#4F3F27] p-2 rounded-full">
                <CircleCheckBig color="#FEB64D" />
              </span>
              <div>
                <Typography variant="base" className="text-white font-semibold">Recipient {idx + 1}</Typography>
                <Typography variant="small" className="text-[#9F9F9F]">{String(toEntry.principal)}</Typography>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 min-w-[160px]">
              <Typography variant="base" className="text-white font-semibold">{(Number(toEntry.amount) / 1e8).toFixed(8)} BTC</Typography>
              <Typography variant="small" className="text-[#9F9F9F]">{toEntry.percentage || ''}{toEntry.percentage ? '%' : ''}</Typography>
              <Button variant="outline" size="sm" className="mt-2">
                <ExternalLink className="w-4 h-4" /> View
              </Button>
            </div>
          </div>
        ))}
      </div>

      <TransactionExplorerLinks transaction={transaction} />
      {/* Info box */}
      <div className="bg-[#232323] border border-[#393939] rounded-xl p-4 mt-6">
        <Typography variant="base" className="text-white font-semibold">
          Escrow executed via ICP-native BTC API with threshold ECDSA signature.
        </Typography>
        <Typography variant="small" className="text-[#9F9F9F]">
          No middleman. No human intervention. Fully automated on-chain execution.
        </Typography>
      </div>
    </div>
  );
}
