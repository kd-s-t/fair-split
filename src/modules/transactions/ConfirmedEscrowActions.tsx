"use client";

import { ConfirmedEscrowActionsProps } from "./types";
import EscrowOverview from "@/components/EscrowOverview";

export default function ConfirmedEscrowActions({ onRelease, onRefund, isLoading, transaction }: ConfirmedEscrowActionsProps) {
  // Calculate total BTC and recipient count
  const totalBTC = Array.isArray(transaction.to)
    ? transaction.to.reduce((sum: number, toEntry) => sum + Number(toEntry.amount), 0) / 1e8
    : 0;

  const recipientCount = transaction.to?.length || 0;

  // Transform recipients data for the new component
  const recipients = Array.isArray(transaction.to) 
    ? transaction.to.map((recipient, index) => ({
        id: recipient.name || `Recipient ${index + 1}`,
        amount: Number(recipient.amount),
        principal: String(recipient.principal)
      }))
    : [];

  const handleRelease = () => {
    onRelease(transaction.id);
  };

  const handleRefund = () => {
    onRefund();
  };



  return (
    <EscrowOverview
      totalBTC={totalBTC}
      recipientCount={recipientCount}
      status={transaction.status}
      recipients={recipients}
      onRelease={handleRelease}
      onRefund={handleRefund}
      isLoading={isLoading === "release" || isLoading === "refund"}
    />
  );
}