"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { CheckCircle, RotateCcw, CircleAlert, Shield, ExternalLink } from "lucide-react";
import { TransactionStats } from "@/components/ui/transaction-stats";
import { TransactionHash } from "@/components/ui/transaction-hash";
import { ConfirmedEscrowActionsProps } from "./types";
import RecipientsList from "./RecipientsList";

export default function ConfirmedEscrowActions({ onRelease, onRefund, isLoading, transaction }: ConfirmedEscrowActionsProps) {
  // Generate a random transaction hash for display
  const generateRandomHash = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const txHash = generateRandomHash();

  // Calculate total BTC and recipient count for TransactionStats
  const totalBTC = Array.isArray(transaction.to)
    ? transaction.to.reduce((sum: number, toEntry: any) => sum + Number(toEntry.amount), 0) / 1e8
    : 0;
  
  const recipientCount = transaction.to?.length || 0;

  return (
    <>
      <TransactionStats 
        totalBTC={totalBTC}
        recipientCount={recipientCount}
        status={transaction.status}
      />

      <hr className="my-6 text-[#424444] h-[1px]" />

      <RecipientsList recipients={transaction.to || []} />

      <hr className="my-6 text-[#424444] h-[1px]" />

      {/* Transaction Hash */}
      <TransactionHash
        title="Transaction hash"
        hash={txHash}
        truncate={true}
        className="mb-6"
      />

      {/* Recipients Breakdown */}
      <div className="mb-6">
        <Typography variant="large" className="mb-4">Recipients breakdown</Typography>
        <div className="space-y-3">
          {transaction.to?.map((toEntry: any, idx: number) => {
            const amount = Number(toEntry.amount) / 1e8;
            const totalAmount = Array.isArray(transaction.to)
              ? transaction.to.reduce((sum: number, entry: any) => sum + Number(entry.amount), 0) / 1e8
              : 0;
            const percentage = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(0) : 0;
            
            return (
              <div key={idx} className="flex justify-between items-center bg-[#232323] border border-[#393939] rounded-lg px-4 py-3">
                <div className="text-white">
                  {toEntry.principal ? String(toEntry.principal).slice(0, 20) + '...' : `Recipient ${idx + 1}`}
                </div>
                <div className="text-white font-semibold">
                  {percentage}% • {amount.toFixed(8)} BTC
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Escrow Actions */}
      <div className="mb-4">
        <Typography variant="large" className="mb-4">Escrow actions</Typography>
        <div className="flex gap-4 mb-4">
          <Button
            variant="default"
            className="w-1/2 flex items-center justify-center gap-2 text-base font-semibold"
            onClick={() => onRelease(transaction.id)}
            disabled={isLoading === "release" || isLoading === "refund"}
          >
            {isLoading === "release" ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                Releasing...
              </span>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> Release payment
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            className="w-1/2 flex items-center justify-center gap-2 text-base font-semibold"
            onClick={onRefund}
            disabled={isLoading === "release" || isLoading === "refund"}
          >
            {isLoading === "refund" ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                Refunding...
              </span>
            ) : (
              <>
                <RotateCcw className="w-5 h-5" /> Request refund
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Warning Note */}
      <div className="w-full mb-4 flex items-center gap-2 rounded-xl bg-[#6B4A1B] border border-[#B8862A] px-4 py-2">
        <CircleAlert size={18} color="#B8862A" />
        <span className="text-white font-medium">Note: Release payment only when you're satisfied with the delivered work or received goods.</span>
      </div>

      {/* Smart Contract Execution Info */}
      <div className="bg-[#232323] border border-[#393939] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield color="#FEB64D" size={20} />
          <div>
            <Typography variant="base" className="text-white font-semibold">
              Smart contract execution
            </Typography>
            <Typography className="text-[#9F9F9F] mt-1">
              Funds are locked and will be released by smart contract logic. No human mediation.
            </Typography>
          </div>
        </div>
      </div>
    </>
  );
}