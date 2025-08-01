"use client";

import { Copy, Shield } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { TransactionStats } from "@/components/ui/transaction-stats";

type ToEntry = {
  principal: string;
  name: string;
  amount: bigint;
  status: { [key: string]: null }; // e.g., { approved: null } or { pending: null }
};

type EscrowTransaction = {
  id: string;
  from: string;
  to: ToEntry[];
  status: "pending" | "confirmed" | "released" | "cancelled";
  timestamp: bigint;
  title: string;
  depositAddress?: string;
  isRead?: boolean;
  releasedAt?: bigint;
  bitcoinAddress?: string;
  bitcoinTransactionHash?: string;
};

export default function CancelledEscrowDetails({ transaction }: { transaction: EscrowTransaction }) {
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

      {transaction.bitcoinTransactionHash && (
        <div className="container-gray mt-4">
          <Typography variant="small" className="text-[#fff] font-semibold">
            Bitcoin Transaction Hash
          </Typography>
          <div className="grid grid-cols-12 gap-3 mt-2">
            <div className="container-gray col-span-11 break-all">
              {transaction.bitcoinTransactionHash}
            </div>
            <div className="container-gray cursor-pointer">
              <Copy />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => window.open(`https://blockstream.info/tx/${transaction.bitcoinTransactionHash}`, '_blank')}
              className="text-[#4F3F27] hover:text-[#FEB64D] text-sm underline"
            >
              View on Blockstream
            </button>
            <button 
              onClick={() => window.open(`https://mempool.space/tx/${transaction.bitcoinTransactionHash}`, '_blank')}
              className="text-[#4F3F27] hover:text-[#FEB64D] text-sm underline"
            >
              View on Mempool
            </button>
          </div>
          <Typography variant="p" className="text-[#9F9F9F] mt-2">
            Bitcoin transaction was detected but escrow was cancelled
          </Typography>
        </div>
      )}

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