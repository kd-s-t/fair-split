"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { ConfirmedEscrowActionsProps, ToEntry } from "./types";
import TimeRemaining from "./TimeRemaining";
import TransactionExplorerLinks from "./TransactionExplorerLinks";

export default function ConfirmedEscrowActions({ onRelease, onRefund, isLoading, transaction }: ConfirmedEscrowActionsProps) {
  const totalBTC = Array.isArray(transaction.to)
    ? transaction.to.reduce((sum: number, toEntry: ToEntry) => sum + Number(toEntry.amount), 0) / 1e8
    : 0;

  const recipientCount = transaction.to?.length || 0;

  return (
    <>
      <div className="container !rounded-2xl !p-6">
        <div className="mb-4">
          <Typography variant="large" className="text-[#FEB64D] mb-2">
            Escrow Confirmed
          </Typography>
          <Typography variant="small" className="text-[#9F9F9F]">
            All recipients have approved. The escrow is now active and ready for release.
          </Typography>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <Typography variant="large" className="text-white font-bold">
              {totalBTC.toFixed(8)}
            </Typography>
            <Typography variant="small" className="text-[#9F9F9F]">
              Total BTC
            </Typography>
          </div>
          <div className="text-center">
            <Typography variant="large" className="text-white font-bold">
              {recipientCount}
            </Typography>
            <Typography variant="small" className="text-[#9F9F9F]">
              Recipients
            </Typography>
          </div>
          <div className="text-center">
            <Typography variant="large" className="text-blue-400 font-bold">
              Active
            </Typography>
            <Typography variant="small" className="text-[#9F9F9F]">
              Status
            </Typography>
          </div>
        </div>

        <TimeRemaining createdAt={transaction.createdAt} />

        <hr className="my-6 text-[#424444] h-[1px]" />

        {/* Combined Recipients List and Breakdown */}
        <div className="mb-6">
          <Typography variant="large" className="text-[#FEB64D] mb-4">Recipients</Typography>
          <div className="space-y-3">
            {Array.isArray(transaction.to) && transaction.to.map((recipient: ToEntry, index: number) => {
              const statusKey = recipient.status ? Object.keys(recipient.status)[0] : 'unknown';
              const statusColor = statusKey === 'approved' ? 'text-green-400' :
                statusKey === 'pending' ? 'text-yellow-400' :
                  statusKey === 'declined' ? 'text-red-400' : 'text-gray-400';

              const amount = Number(recipient.amount) / 1e8;
              const totalAmount = Array.isArray(transaction.to)
                ? transaction.to.reduce((sum: number, entry: ToEntry) => sum + Number(entry.amount), 0) / 1e8
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
                "Release Escrow"
              )}
            </Button>
            <Button
              variant="outline"
              className="w-1/2 text-base font-semibold"
              onClick={onRefund}
              disabled={isLoading === "release" || isLoading === "refund"}
            >
              {isLoading === "refund" ? (
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
                  Refunding...
                </span>
              ) : (
                "Refund Escrow"
              )}
            </Button>
          </div>
          <Typography variant="small" className="text-[#9F9F9F]">
            Release distributes funds to all recipients. Refund returns funds to the sender.
          </Typography>
        </div>
      </div>
    </>
  );
}