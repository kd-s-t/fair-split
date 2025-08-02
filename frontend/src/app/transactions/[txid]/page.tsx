"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import { Principal } from "@dfinity/principal";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { TransactionLifecycle } from "@/modules/transactions/Lifecycle";
import PendingEscrowDetails from "@/modules/transactions/PendingEscrowDetails";
import CancelledEscrowDetails from "@/modules/transactions/CancelledEscrowDetails";
import ConfirmedEscrowActions from "@/modules/transactions/ConfirmedEscrowActions";
import ReleasedEscrowDetails from "@/modules/transactions/ReleasedEscrowDetails";
import type { Transaction } from "@/declarations/split_dapp.did";
import type { SerializedTransaction } from "@/modules/transactions/types";
import { AnimatePresence, motion } from "framer-motion";

export default function TransactionDetailsPage() {
  const [isLoading, setIsLoading] = useState<"release" | "refund" | null>(null);
  const [transaction, setTransaction] = useState<SerializedTransaction | null>(null);
  const [isTxLoading, setIsTxLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { txid } = useParams();
  const { principal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!txid || !principal) return;
      setIsTxLoading(true);
      try {
        const actor = await createSplitDappActor();
        const { AuthClient } = await import('@dfinity/auth-client');
        const authClient = await AuthClient.create();
        const isAuthenticated = await authClient.isAuthenticated();

        if (!isAuthenticated) {
          toast.error("Please log in to view transaction details");
          router.push('/transactions');
          return;
        }

        const result = await actor.getTransaction(txid as string, principal);
        if (!Array.isArray(result) || result.length === 0) {
          toast.error("Transaction not found");
          router.push('/transactions');
          return;
        }
        
        // Serialize BigInt values to strings for Redux compatibility
        const serializedTransaction = {
          ...result[0],
          timestamp: result[0].createdAt?.toString() || "0",
          createdAt: result[0].createdAt?.toString() || "0",
          confirmedAt: result[0].confirmedAt ? result[0].confirmedAt.toString() : undefined,
          cancelledAt: result[0].cancelledAt ? result[0].cancelledAt.toString() : undefined,
          refundedAt: result[0].refundedAt ? result[0].refundedAt.toString() : undefined,
          releasedAt: result[0].releasedAt ? result[0].releasedAt.toString() : undefined,
          readAt: result[0].readAt ? result[0].readAt.toString() : undefined,
          to: Array.isArray(result[0].to) ? result[0].to.map((toEntry: any) => ({
            ...toEntry,
            approvedAt: toEntry.approvedAt ? toEntry.approvedAt.toString() : undefined,
            declinedAt: toEntry.declinedAt ? toEntry.declinedAt.toString() : undefined,
            readAt: toEntry.readAt ? toEntry.readAt.toString() : undefined,
          })) : []
        };
        
        console.log("transaction", serializedTransaction);
        setTransaction(serializedTransaction);
        setIsAuthorized(true);
        setIsTxLoading(false);
      } catch (err) {
        console.error("err", err);
        toast.error("Transaction not found");
      }
    };
    fetchTransaction();
  }, [txid, principal, router]);

  const handleRelease = async (id: unknown) => {
    setIsLoading("release");
    try {
      const actor = await createSplitDappActor();
      await actor.releaseSplit(principal, String(id));
      toast.success("Escrow released!");
      // Fetch updated transaction and update state
      const updated = await actor.getTransaction(String(id), principal);
      if (Array.isArray(updated) && updated.length > 0) {
        // Serialize BigInt values to strings for Redux compatibility
        const serializedUpdated = {
          ...updated[0],
          timestamp: updated[0].createdAt?.toString() || "0",
          createdAt: updated[0].createdAt?.toString() || "0",
          confirmedAt: updated[0].confirmedAt ? updated[0].confirmedAt.toString() : undefined,
          cancelledAt: updated[0].cancelledAt ? updated[0].cancelledAt.toString() : undefined,
          refundedAt: updated[0].refundedAt ? updated[0].refundedAt.toString() : undefined,
          releasedAt: updated[0].releasedAt ? updated[0].releasedAt.toString() : undefined,
          readAt: updated[0].readAt ? updated[0].readAt.toString() : undefined,
          to: Array.isArray(updated[0].to) ? updated[0].to.map((toEntry: any) => ({
            ...toEntry,
            approvedAt: toEntry.approvedAt ? toEntry.approvedAt.toString() : undefined,
            declinedAt: toEntry.declinedAt ? toEntry.declinedAt.toString() : undefined,
            readAt: toEntry.readAt ? toEntry.readAt.toString() : undefined,
          })) : []
        };
        setTransaction(serializedUpdated);
        setIsAuthorized(true);
        setIsTxLoading(false);
      }
    } catch (err) {
      console.error("Release error:", err);
      toast.error("Failed to release escrow");
    } finally {
      setIsLoading(null);
    }
  };

  const handleCancel = async () => {
    setIsLoading("refund");
    try {
      const actor = await createSplitDappActor();
      await actor.cancelSplit(Principal.fromText(
        typeof transaction?.from === "string"
          ? transaction.from
          : transaction?.from?.toText?.() || ""
      ));
      toast.success("Escrow cancelled!");
      // Refresh the transaction data
      const updated = await actor.getTransaction(String(txid), principal);
      if (Array.isArray(updated) && updated.length > 0) {
        // Serialize BigInt values to strings for Redux compatibility
        const serializedUpdated = {
          ...updated[0],
          timestamp: updated[0].createdAt?.toString() || "0",
          createdAt: updated[0].createdAt?.toString() || "0",
          confirmedAt: updated[0].confirmedAt ? updated[0].confirmedAt.toString() : undefined,
          cancelledAt: updated[0].cancelledAt ? updated[0].cancelledAt.toString() : undefined,
          refundedAt: updated[0].refundedAt ? updated[0].refundedAt.toString() : undefined,
          releasedAt: updated[0].releasedAt ? updated[0].releasedAt.toString() : undefined,
          readAt: updated[0].readAt ? updated[0].readAt.toString() : undefined,
          to: Array.isArray(updated[0].to) ? updated[0].to.map((toEntry: any) => ({
            ...toEntry,
            approvedAt: toEntry.approvedAt ? toEntry.approvedAt.toString() : undefined,
            declinedAt: toEntry.declinedAt ? toEntry.declinedAt.toString() : undefined,
            readAt: toEntry.readAt ? toEntry.readAt.toString() : undefined,
          })) : []
        };
        setTransaction(serializedUpdated);
      }
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error("Failed to cancel escrow");
    } finally {
      setIsLoading(null);
    }
  };

  const handleRefund = async () => {
    setIsLoading("refund");
    try {
      const actor = await createSplitDappActor();
      await actor.cancelSplit(Principal.fromText(
        typeof transaction?.from === "string"
          ? transaction.from
          : transaction?.from?.toText?.() || ""
      ));
      toast.success("Escrow refunded!");
    } catch (err) {
      console.error("Refund error:", err);
      toast.error("Failed to refund escrow");
    } finally {
      setIsLoading(null);
    }
  };

  if (isTxLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!transaction || !isAuthorized) {
    return <div className="p-6 text-center">Transaction not found.</div>;
  }

  const statusKey = transaction.status || "unknown";
  
  let currentStep = 0;
  if (statusKey === "released") currentStep = 3;
  else if (statusKey === "confirmed") currentStep = 2;
  else if (statusKey === "pending") currentStep = 0;
  else if (statusKey === "cancelled") currentStep = 0;

  const totalBTC = Array.isArray(transaction.to)
    ? transaction.to.reduce((sum: number, toEntry: any) => sum + Number(toEntry.amount), 0) / 1e8
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence>
        {statusKey === "released" && (
          <motion.div
            key="escrow-completed-banner"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="rounded-xl bg-gradient-to-r from-[#1be37c] to-[#b0ff6c] p-4 flex items-center justify-between mb-2"
          >
            <div>
              <div className="text-lg font-semibold text-black">Escrow completed</div>
              <div className="text-sm text-black/80">All payments have been successfully distributed to recipients</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-black">{totalBTC.toFixed(8)} BTC</div>
              <div className="text-xs text-black/80">BTC Released</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="container flex-1 rounded-2xl px-6 py-4 text-white">
          <Typography variant="large">Escrow overview</Typography>

          {statusKey === "released" && (
            <ReleasedEscrowDetails transaction={transaction} />
          )}

          {statusKey === "pending" && (
            <PendingEscrowDetails 
              transaction={{
                ...transaction,
                from: typeof transaction.from === "string" ? transaction.from : transaction.from.toText(),
                to: Array.isArray(transaction.to)
                  ? transaction.to.map((toEntry: any) => ({
                      ...toEntry,
                      principal: typeof toEntry.principal === "string" ? toEntry.principal : toEntry.principal.toText(),
                    }))
                  : [],
                status: "pending",
                releasedAt: Array.isArray(transaction.releasedAt)
                  ? (transaction.releasedAt.length > 0 ? transaction.releasedAt[0] : undefined)
                  : transaction.releasedAt,
                bitcoinAddress: Array.isArray(transaction.bitcoinAddress) 
                  ? (transaction.bitcoinAddress.length > 0 ? transaction.bitcoinAddress[0] : undefined)
                  : transaction.bitcoinAddress,
                bitcoinTransactionHash: Array.isArray(transaction.bitcoinTransactionHash)
                  ? (transaction.bitcoinTransactionHash.length > 0 ? transaction.bitcoinTransactionHash[0] : undefined)
                  : transaction.bitcoinTransactionHash
              }}
              onCancel={handleCancel}
            />
          )}

          {statusKey === "cancelled" && (
            <CancelledEscrowDetails 
              transaction={{
                ...transaction,
                from: typeof transaction.from === "string" ? transaction.from : transaction.from.toText(),
                to: Array.isArray(transaction.to)
                  ? transaction.to.map((toEntry: any) => ({
                      ...toEntry,
                      principal: typeof toEntry.principal === "string" ? toEntry.principal : toEntry.principal.toText(),
                    }))
                  : [],
                status: "cancelled",
                releasedAt: Array.isArray(transaction.releasedAt)
                  ? (transaction.releasedAt.length > 0 ? transaction.releasedAt[0] : undefined)
                  : transaction.releasedAt,
                bitcoinAddress: Array.isArray(transaction.bitcoinAddress) 
                  ? (transaction.bitcoinAddress.length > 0 ? transaction.bitcoinAddress[0] : undefined)
                  : transaction.bitcoinAddress,
                bitcoinTransactionHash: Array.isArray(transaction.bitcoinTransactionHash)
                  ? (transaction.bitcoinTransactionHash.length > 0 ? transaction.bitcoinTransactionHash[0] : undefined)
                  : transaction.bitcoinTransactionHash
              }}
            />
          )}

          {statusKey === "confirmed" && (
            <ConfirmedEscrowActions
              transaction={transaction}
              isLoading={isLoading}
              onRelease={handleRelease}
              onRefund={handleRefund}
            />
          )}
        </div>

        <Card className="w-full md:w-90 bg-[#222222] border-[#303434] text-white flex flex-col gap-4">
          <Typography variant="large">Transaction lifecycle</Typography>
          <div className="container-primary text-sm">
            Native Bitcoin Escrow — No bridges or wrapped tokens
          </div>
          <TransactionLifecycle currentStep={currentStep} />
          <div className="container-gray text-sm text-[#9F9F9F]">
            This escrow is executed fully on-chain using Internet Computer. No human mediation.
          </div>
        </Card>
      </div>
    </div>
  );
}
