"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { CheckCircle, RotateCcw, CircleAlert, Shield } from "lucide-react";
import TransactionStats from "@/components/TransactionStats";
import { ConfirmedEscrowActionsProps } from "./types";
import TimeRemaining from "./TimeRemaining";
import TransactionExplorerLinks from "./TransactionExplorerLinks";
import { Fragment } from "react";
// import { generateRandomHash } from "@/lib/utils";

export default function ConfirmedEscrowActions({ onRelease, onRefund, isLoading, transaction }: ConfirmedEscrowActionsProps) {

  // const txHash = generateRandomHash();

  const handleCancelSplit = async () => {
    console.log("handleCancelSplit called");
    // Just call the parent's onRefund function which handles everything
    if (onRefund) {
      console.log("Calling onRefund");
      onRefund();
    } else {
      console.log("onRefund is not defined");
    }
  };

  // Calculate total BTC and recipient count for TransactionStats
  const totalBTC = Array.isArray(transaction.to)
    ? transaction.to.reduce((sum: number, toEntry: any) => sum + Number(toEntry.amount), 0) / 1e8
    : 0;

  const recipientCount = transaction.to?.length || 0;

  return (
    <Fragment>
      <div className="container !rounded-2xl !p-6">

        <Typography variant="large" className="mb-4">Escrow overview</Typography>

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

              const amount = Number(recipient.amount) / 1e8;
              const totalAmount = Array.isArray(transaction.to)
                ? transaction.to.reduce((sum: number, entry: any) => sum + Number(entry.amount), 0) / 1e8
                : 0;
              const percentage = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(0) : 0;

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
                        {percentage}%
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
      </div>
      <div className="container !rounded-2xl !p-6 mt-4">
        {/* Escrow Actions */}
        <div className="mb-4 mt-4">
          <Typography variant="large" className="mb-4">Escrow actions</Typography>
          <div className="flex gap-4 mb-4">
            <Button
              variant="default"
              className="w-1/2 text-base font-semibold"
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
              className="w-1/2 text-base font-semibold"
              onClick={handleCancelSplit}
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
          <Typography variant="small" className="text-[#9F9F9F]">
            Release distributes funds to all recipients. Refund returns funds to the sender.
          </Typography>
        </div>

        {/* Warning Note */}
        <div className="w-full mb-4 flex items-center gap-2 rounded-xl bg-[#6B4A1B] border border-[#B8862A] px-4 py-2">
          <CircleAlert size={18} color="#B8862A" />
                           <Typography variant="small" className="font-normal">Note: Release payment only when you&apos;re satisfied with the delivered work or received goods.</Typography>
        </div>

        {/* Smart Contract Execution Info */}
        <div className="container-gray">
          <div className="flex items-center gap-3">

            <div className="bg-[#FEB64D]/20 rounded-full p-2">
              <Shield color="#FEB64D" size={20} />
            </div>

            <div>
              <Typography variant="base" className="font-semibold">
                Smart contract execution
              </Typography>
              <Typography className="text-[#9F9F9F] mt-1">
                Funds are locked and will be released by smart contract logic. No human mediation.
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}