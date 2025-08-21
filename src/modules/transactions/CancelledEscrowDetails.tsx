"use client";

import { Copy, Shield, QrCode, ExternalLink, CircleCheckBig } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import TransactionStats from "@/components/TransactionStats";

import { CancelledEscrowDetailsProps } from "./types";
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

      {/* Payment Distribution */}
      <Typography variant="large" className="mb-4">Payment distribution</Typography>

      <div className="space-y-4">
        {Array.isArray(transaction.to) && transaction.to.map((recipient, index) => {
          const amount = Number(recipient.amount) / 1e8;
          const totalAmount = transaction.to.reduce((sum: number, entry) => sum + Number(entry.amount), 0) / 1e8;
          const percentage = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
          
          return (
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
                      {String(recipient.principal).slice(0, 20)}...
                    </Typography>
                  </div>
                </div>
                <div className="text-right">
                  <Typography variant="base" className="text-white font-semibold">
                    {amount.toFixed(8)} BTC
                  </Typography>
                  <Typography variant="small" className="text-[#9F9F9F]">
                    {percentage}%
                  </Typography>
                </div>
              </div>
            </div>
          );
        })}
      </div>


      <div className="flex gap-4 mt-6">
        <Button 
          variant="outline" 
          className="flex-1 flex items-center gap-2"
          onClick={() => window.open(`${process.env.NEXT_PUBLIC_BLOCKSTREAM_URL}/block/00000000000000000000dc0024df0a2931ba3d495d37256809f6520178476e8c`, '_blank')}
        >
          <QrCode className="w-4 h-4" />
          <span>View Explorer</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 flex items-center gap-2"
          onClick={() => window.open(`${process.env.NEXT_PUBLIC_BLOCKSTREAM_URL}/block/00000000000000000000dc0024df0a2931ba3d495d37256809f6520178476e8c`, '_blank')}
        >
          <ExternalLink className="w-4 h-4" />
          <span>View Explorer</span>
        </Button>
      </div>

    </div>
  );
} 