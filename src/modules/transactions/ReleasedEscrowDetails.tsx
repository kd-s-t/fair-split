'use client'

import { Typography } from "@/components/ui/typography";
import { ReleasedEscrowDetailsProps } from "./types";
import { Bitcoin, UsersRound, Zap, CircleCheckBig, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReleasedEscrowDetails({ transaction }: ReleasedEscrowDetailsProps) {
  const totalBTC = Array.isArray(transaction.to) 
    ? transaction.to.reduce((sum: number, toEntry) => sum + Number(toEntry.amount), 0) / 1e8 
    : 0;
  const recipientCount = transaction.to?.length || 0;
  const releasedAt = transaction.releasedAt ? new Date(Number(transaction.releasedAt) / 1000000) : new Date();
  const completedDate = releasedAt;
  
  const recipients = Array.isArray(transaction.to) ? transaction.to.map((recipient, index) => {
    const amount = Number(recipient.amount) / 1e8;
    const totalAmount = transaction.to.reduce((sum: number, entry) => sum + Number(entry.amount), 0) / 1e8;
    const percentage = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
    return { 
      address: String(recipient.principal).slice(0, 20) + "...", 
      amount: Number(recipient.amount), 
      percentage 
    };
  }) : [];

  const transactionHash = transaction.bitcoinTransactionHash ? String(transaction.bitcoinTransactionHash) : "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
  
  const handleViewExplorer = () => {
    // Mock Bitcoin transaction hash
    const mockBtcTxHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
    const explorerUrl = process.env.NEXT_PUBLIC_BTC_EXPLORER_URL || "https://blockstream.info";
    window.open(`${explorerUrl}/tx/${mockBtcTxHash}`, '_blank');
  };

  return (
    <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-6">
      {/* Title */}
      <Typography variant="large" className="text-white">Escrow overview</Typography>



      {/* Transaction Details */}
      <div className="grid grid-cols-2 gap-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4H21V6H3V4ZM3 10H21V12H3V10ZM3 16H21V18H3V16Z" fill="#FEB64D"/>
            </svg>
          </div>
          <div>
            <Typography variant="small" className="text-[#9F9F9F]">Completed on</Typography>
            <Typography variant="base" className="text-white">
              {completedDate.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 3H20V5H4V3ZM4 9H20V11H4V9ZM4 15H20V17H4V15Z" fill="#FEB64D"/>
            </svg>
          </div>
          <div>
            <Typography variant="small" className="text-[#9F9F9F]">Transaction</Typography>
            <button 
              onClick={handleViewExplorer}
              className="text-white font-mono hover:text-[#FEB64D] transition-colors cursor-pointer"
            >
              {transactionHash ? `${transactionHash.slice(0, 20)}...` : 'a1b2c3d4e5f678901234...'}
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#424444]" />

      {/* Payment Distribution */}
      <Typography variant="large" className="text-white">Payment distribution</Typography>
      
      <div className="space-y-4">
        {recipients.map((recipient, index) => (
          <div key={index} className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
                  <CircleCheckBig size={24} className="text-[#FEB64D]" />
                </div>
                <div>
                  <Typography variant="base" className="text-white font-semibold">
                    Recipient {index + 1}
                  </Typography>
                  <Typography variant="small" className="text-[#9F9F9F]">
                    {recipient.address}
                  </Typography>
                </div>
              </div>
              <div className="text-right">
                <Typography variant="base" className="text-white font-semibold">
                  {(recipient.amount / 1e8).toFixed(8)} BTC
                </Typography>
                <Typography variant="small" className="text-[#9F9F9F]">
                  {recipient.percentage}%
                </Typography>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
        <Typography variant="base" className="text-white">
          Escrow executed via ICP-native BTC API with threshold ECDSA signature.
        </Typography>
        <Typography variant="small" className="text-[#9F9F9F] mt-2">
          No middleman. No human intervention. Fully automated on-chain execution.
        </Typography>
      </div>
    </div>
  );
}
