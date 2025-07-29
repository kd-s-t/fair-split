"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { CheckCircle, RotateCcw } from "lucide-react";

export default function ConfirmedEscrowActions({ onRelease, onRefund, isLoading, transaction }: any) {
  return (
    <div className="flex gap-4 mb-2">
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
  );
}