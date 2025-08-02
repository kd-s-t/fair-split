"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, CalendarCheck2, Hash, CircleCheckBig } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { TransactionStats } from "@/components/ui/transaction-stats";
import { TransactionHash } from "@/components/ui/transaction-hash";
import { ReleasedEscrowDetailsProps } from "./types";
import RecipientsList from "./RecipientsList";
import TimeRemaining from "./TimeRemaining";
import TransactionExplorerLinks from "./TransactionExplorerLinks";

export default function ReleasedEscrowDetails({ transaction }: ReleasedEscrowDetailsProps) {
  // Calculate total released BTC
  const totalBTC = Array.isArray(transaction.to)
    ? transaction.to.reduce((sum: number, toEntry: any) => sum + Number(toEntry.amount), 0) / 1e8
    : 0;
  
  const recipientCount = transaction.to?.length || 0;
  
  // Use releasedAt if present, otherwise fallback to timestamp
  const releasedAt = transaction.releasedAt;
  const completedDate = releasedAt
    ? new Date(Number(releasedAt) * 1000)
    : (transaction.timestamp ? new Date(Number(transaction.timestamp) * 1000) : new Date());

  return (
    <div className="mb-8">
      <TransactionStats 
        totalBTC={totalBTC}
        recipientCount={recipientCount}
        status={transaction.status}
      />
      
      <TimeRemaining createdAt={transaction.createdAt} />
      
      <hr className="my-6 text-[#424444] h-[1px]" />

      {/* Combined Recipients List and Breakdown */}
      <div className="mb-6">
        <Typography variant="large" className="text-[#FEB64D] mb-4">Recipients</Typography>
        <div className="space-y-3">
          {Array.isArray(transaction.to) && transaction.to.map((recipient: any, index: number) => {
            const statusKey = recipient.status ? Object.keys(recipient.status)[0] : 'unknown';
            const statusColor = statusKey === 'approved' ? 'text-green-400' : 
                               statusKey === 'pending' ? 'text-yellow-400' : 
                               statusKey === 'declined' ? 'text-red-400' : 'text-gray-400';
            
            return (
              <div key={index} className="bg-[#2a2a2a] rounded-lg p-4 border border-[#303434]">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Typography variant="base" className="text-white font-semibold">
                      {recipient.name || `Recipient ${index + 1}`}
                    </Typography>
                    <Typography variant="small" className="text-[#FEB64D] mt-1">
                      {(Number(recipient.amount) / 1e8).toFixed(8)} BTC
                    </Typography>
                    <Typography variant="small" className="text-[#9F9F9F] mt-1">
                      {recipient.percentage || ''}{recipient.percentage ? '%' : ''}
                    </Typography>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor}`}>
                      {statusKey}
                    </span>
                    {recipient.approvedAt && (
                      <Typography variant="small" className="text-gray-500 mt-1">
                        {new Date(Number(recipient.approvedAt) / 1_000_000).toLocaleString()}
                      </Typography>
                    )}
                    {recipient.declinedAt && (
                      <Typography variant="small" className="text-gray-500 mt-1">
                        {new Date(Number(recipient.declinedAt) / 1_000_000).toLocaleString()}
                      </Typography>
                    )}
                    {statusKey === 'pending' && !recipient.approvedAt && !recipient.declinedAt && (
                      <Typography variant="small" className="text-gray-500 mt-1">
                        No action taken yet
                      </Typography>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="my-6 text-[#424444] h-[1px]" />
      
      <TransactionExplorerLinks transaction={transaction} />
      
      {/* Escrow overview */}
      <div className="mb-6 bg-[#181818] rounded-2xl p-6">
        <Typography variant="large" className="mb-4">Escrow overview</Typography>
        <div className="flex flex-col md:flex-row gap-8 mb-6">
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
                {transaction.txHash ? `${transaction.txHash.slice(0, 10)}...` : 'N/A'}
              </Typography>
            </div>
          </div>
        </div>
        <hr className="my-4 text-[#424444] h-[1px]" />
        {/* Payment distribution */}
        <Typography variant="large" className="mb-4">Payment distribution</Typography>
        <div className="flex flex-col gap-4">
          {Array.isArray(transaction.to) && transaction.to.map((toEntry: any, idx: number) => (
            <div key={idx} className="bg-[#232323] border border-[#393939] rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="bg-[#4F3F27] p-2 rounded-full">
                  <CircleCheckBig color="#FEB64D" />
                </span>
                <div>
                  <Typography variant="base" className="text-white font-semibold">Recipient {idx + 1}</Typography>
                  <Typography variant="small" className="text-[#9F9F9F]">{String(toEntry.address || toEntry.principal)}</Typography>
                  {toEntry.txHash && (
                    <div className="mt-1">
                      <Typography variant="small" className="text-[#9F9F9F]">Transaction hash</Typography>
                      <div className="flex items-center gap-2 mt-1">
                        <Typography variant="small" className="text-white font-mono">
                          {toEntry.txHash.slice(0, 18)}...
                        </Typography>
                        <button 
                          onClick={() => window.open(`https://blockstream.info/tx/${toEntry.txHash}`, '_blank')}
                          className="text-[#4F3F27] hover:text-[#FEB64D] text-xs underline"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 min-w-[160px]">
                <Typography variant="base" className="text-white font-semibold">{(Number(toEntry.amount) / 1e8).toFixed(8)} BTC</Typography>
                <Typography variant="small" className="text-[#9F9F9F]">{toEntry.percentage || ''}{toEntry.percentage ? '%' : ''}</Typography>
                <Button variant="outline" size="sm" className="mt-2 flex items-center gap-1">
                  <ExternalLink className="w-4 h-4" /> View
                </Button>
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
}
