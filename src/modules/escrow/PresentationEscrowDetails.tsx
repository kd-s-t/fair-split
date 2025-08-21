'use client'

import { Typography } from "@/components/ui/typography";
import { CircleCheckBig, ExternalLink, Bitcoin } from "lucide-react";
import { Button } from "@/components/ui/button";

// Demo transaction data for presentation
const demoTransaction = {
  id: "demo-escrow-123",
  bitcoinTransactionHash: "00000000000000000001bb418ff8dfff65ea0dab3d9f53923112d2b2f12f4ee7",
  releasedAt: BigInt(Date.now() * 1000000), // Current time in nanoseconds
  to: [
    {
      principal: "demo-principal-1",
      amount: BigInt(0.6 * 1e8), // 0.6 BTC
      percentage: 60
    },
    {
      principal: "demo-principal-2",
      amount: BigInt(0.3 * 1e8), // 0.3 BTC
      percentage: 30
    },
    {
      principal: "demo-principal-3",
      amount: BigInt(0.1 * 1e8), // 0.1 BTC
      percentage: 10
    }
  ]
};

export default function PresentationEscrowDetails() {
  const totalBTC = Array.isArray(demoTransaction.to)
    ? demoTransaction.to.reduce((sum: number, toEntry) => sum + Number(toEntry.amount), 0) / 1e8
    : 0;

  const releasedAt = demoTransaction.releasedAt ? new Date(Number(demoTransaction.releasedAt) / 1000000) : new Date();
  const completedDate = releasedAt;

  const recipients = Array.isArray(demoTransaction.to) ? demoTransaction.to.map((recipient, index) => {
    const amount = Number(recipient.amount) / 1e8;
    const totalAmount = demoTransaction.to.reduce((sum: number, entry) => sum + Number(entry.amount), 0) / 1e8;
    const percentage = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
    return {
      address: String(recipient.principal).slice(0, 20) + "...",
      amount: Number(recipient.amount),
      percentage,
      role: ["Developer", "Designer", "QA"][index] || `Recipient ${index + 1}`
    };
  }) : [];

  const transactionHash = demoTransaction.bitcoinTransactionHash ? String(demoTransaction.bitcoinTransactionHash) : "";

  const handleViewExplorer = () => {
    const explorerUrl = "https://blockstream.info";
    const url = `${explorerUrl}/block/${transactionHash}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <Bitcoin className="text-[#FEB64D] h-6 w-6" />
        <Typography variant="large" className="text-white">Escrow Execution Demo</Typography>
      </div>

      {/* Transaction Details */}
      <div className="grid grid-cols-2 gap-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4H21V6H3V4ZM3 10H21V12H3V10ZM3 16H21V18H3V16Z" fill="#FEB64D" />
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
              <path d="M4 3H20V5H4V3ZM4 9H20V11H4V9ZM4 15H20V17H4V15Z" fill="#FEB64D" />
            </svg>
          </div>
          <div>
            <Typography variant="small" className="text-[#9F9F9F]">Bitcoin Block</Typography>
            <Typography
              variant="base"
              className="text-white font-mono cursor-pointer hover:text-[#FEB64D] transition-colors"
              onClick={handleViewExplorer}
            >
              {transactionHash ? `${transactionHash.slice(0, 20)}...` : 'Loading...'}
            </Typography>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#424444]" />

      {/* Payment Distribution */}
      <Typography variant="large" className="text-white">Payment Distribution</Typography>

      <div className="space-y-4">
        {recipients.map((recipient, index) => (
          <div key={index} className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4 transition-all duration-200 hover:border-[#FEB64D]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
                  <CircleCheckBig size={24} className="text-[#FEB64D]" />
                </div>
                <div>
                  <Typography variant="base" className="text-white font-semibold">
                    {recipient.role}
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

      {/* Total Amount */}
      <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
        <div className="flex items-center justify-between">
          <Typography variant="base" className="text-white font-semibold">
            Total Amount
          </Typography>
          <div className="flex items-center gap-2">
            <Bitcoin className="text-[#FEB64D] h-5 w-5" />
            <Typography variant="large" className="text-[#FEB64D] font-bold">
              {totalBTC.toFixed(8)} BTC
            </Typography>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
        <Typography variant="base" className="text-white">
          Escrow executed via ICP-native BTC API with threshold ECDSA signature.
        </Typography>
        <Typography variant="small" className="text-[#9F9F9F] mt-2">
          No middleman. No human intervention. Fully automated on-chain execution.
        </Typography>
        <Button
          onClick={handleViewExplorer}
          variant="outline"
          className="mt-3 flex items-center gap-2"
        >
          <ExternalLink size={16} />
          View on Blockstream
        </Button>
      </div>
    </div>
  );
}
