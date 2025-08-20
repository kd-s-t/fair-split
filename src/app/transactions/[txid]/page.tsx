"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useAuth } from "@/contexts/auth-context";
import { TRANSACTION_STATUS } from "@/lib/constants";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import CancelledEscrowDetails from "@/modules/transactions/CancelledEscrowDetails";
import ConfirmedEscrowActions from "@/modules/transactions/ConfirmedEscrowActions";
import EditEscrowDetails from "@/modules/transactions/EditEscrowDetails";
import { TransactionLifecycle } from "@/modules/transactions/Lifecycle";
import PendingEscrowDetails from "@/modules/transactions/PendingEscrowDetails";
import RefundedEscrowDetails from "@/modules/transactions/RefundedEscrowDetails";
import TransactionStats from "@/components/TransactionStats";
import TimeRemaining from "@/modules/transactions/TimeRemaining";
import type { NormalizedTransaction, ApiToEntry } from "@/modules/transactions/types";

// Type for Principal objects that might have toText method
interface PrincipalLike {
  toText?: () => string;
}
import ReleasedEscrowDetails from "@/modules/transactions/ReleasedEscrowDetails";
import { Principal } from "@dfinity/principal";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setTitle, setSubtitle } from "@/lib/redux/store";

export default function TransactionDetailsPage() {
  const [isLoading, setIsLoading] = useState<"release" | "refund" | null>(null);
  const [transaction, setTransaction] = useState<NormalizedTransaction | null>(null);
  const [isTxLoading, setIsTxLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { txid } = useParams();
  const { principal } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();

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
          to: Array.isArray(result[0].to) ? result[0].to.map((toEntry: ApiToEntry) => ({
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

  // Set title and subtitle when transaction loads
  useEffect(() => {
    if (transaction) {
      dispatch(setTitle(transaction.title || 'Transaction Details'));
      
      // Set subtitle based on status
      const statusKey = transaction.status || "unknown";
      let subtitle = '';
      if (statusKey === TRANSACTION_STATUS.PENDING) {
        subtitle = 'Waiting for Bitcoin deposit to activate';
      } else if (statusKey === TRANSACTION_STATUS.CONFIRMED) {
        subtitle = 'Waiting for sender to release or refund';
      } else if (statusKey === TRANSACTION_STATUS.RELEASED) {
        subtitle = 'Escrow completed successfully';
      } else if (statusKey === TRANSACTION_STATUS.REFUND) {
        subtitle = 'Escrow has been refunded';
      } else if (statusKey === TRANSACTION_STATUS.CANCELLED || statusKey === TRANSACTION_STATUS.DECLINED) {
        subtitle = 'Escrow has been cancelled';
      }
      
      dispatch(setSubtitle(subtitle));
    }
  }, [transaction, dispatch]);

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
          to: Array.isArray(updated[0].to) ? updated[0].to.map((toEntry: ApiToEntry) => ({
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
          : (transaction?.from as Principal | undefined)?.toText?.() || ""
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
          to: Array.isArray(updated[0].to) ? updated[0].to.map((toEntry: ApiToEntry) => ({
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
    console.log("handleRefund called");
    setIsLoading("refund");
    try {
      console.log("Creating actor");
      const actor = await createSplitDappActor();
      console.log("Calling refundSplit with principal:", transaction?.from);
      await actor.refundSplit(Principal.fromText(
        typeof transaction?.from === "string"
          ? transaction.from
          : (transaction?.from as Principal | undefined)?.toText?.() || ""
      ));
      console.log("refundSplit successful");
      toast.success("Escrow refunded!");
      // Refresh the transaction data
      console.log("Refreshing transaction data");
      const updated = await actor.getTransaction(String(txid), principal);
      console.log("Updated transaction:", updated);
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
          to: Array.isArray(updated[0].to) ? updated[0].to.map((toEntry: ApiToEntry) => ({
            ...toEntry,
            approvedAt: toEntry.approvedAt ? toEntry.approvedAt.toString() : undefined,
            declinedAt: toEntry.declinedAt ? toEntry.declinedAt.toString() : undefined,
            readAt: toEntry.readAt ? toEntry.readAt.toString() : undefined,
          })) : []
        };
        console.log("Setting updated transaction:", serializedUpdated);
        setTransaction(serializedUpdated);
      }
    } catch (err) {
      console.error("Refund error:", err);
      toast.error("Failed to refund escrow");
    } finally {
      console.log("Clearing loading state");
      setIsLoading(null);
    }
  };

  const handleEdit = async () => {
    // Navigate to escrow page with current transaction data for editing
    router.push(`/escrow?edit=${txid}`);
  };

  const handleApprove = async () => {
    if (!transaction || !principal) return;
    
    try {
      const actor = await createSplitDappActor();
      const senderPrincipal = typeof transaction.from === "string" ? Principal.fromText(transaction.from) : transaction.from;
      const principalStr = typeof principal === "string" ? principal : principal.toText();
      const recipientEntry = transaction.to.find((entry) => String(entry.principal) === principalStr);
      
      if (!recipientEntry) {
        toast.error('Recipient entry not found.');
        return;
      }
      
      const recipientPrincipal = typeof recipientEntry.principal === "string"
        ? Principal.fromText(recipientEntry.principal)
        : recipientEntry.principal;

      await actor.recipientApproveEscrow(senderPrincipal, transaction.id, recipientPrincipal);
      toast.success("Escrow approved!");
      
      // Fetch updated transaction and update state
      const updated = await actor.getTransaction(transaction.id, principal);
      if (Array.isArray(updated) && updated.length > 0) {
        const serializedUpdated = {
          ...updated[0],
          timestamp: updated[0].createdAt?.toString() || "0",
          createdAt: updated[0].createdAt?.toString() || "0",
          confirmedAt: updated[0].confirmedAt ? updated[0].confirmedAt.toString() : undefined,
          cancelledAt: updated[0].cancelledAt ? updated[0].cancelledAt.toString() : undefined,
          refundedAt: updated[0].refundedAt ? updated[0].refundedAt.toString() : undefined,
          releasedAt: updated[0].releasedAt ? updated[0].releasedAt.toString() : undefined,
          readAt: updated[0].readAt ? updated[0].readAt.toString() : undefined,
          to: Array.isArray(updated[0].to) ? updated[0].to.map((toEntry: ApiToEntry) => ({
            ...toEntry,
            approvedAt: toEntry.approvedAt ? toEntry.approvedAt.toString() : undefined,
            declinedAt: toEntry.declinedAt ? toEntry.declinedAt.toString() : undefined,
            readAt: toEntry.readAt ? toEntry.readAt.toString() : undefined,
          })) : []
        };
        setTransaction(serializedUpdated);
      }
    } catch (err) {
      console.error("Approve error:", err);
      toast.error("Failed to approve escrow");
    }
  };

  const handleDecline = async () => {
    if (!transaction || !principal) return;
    
    try {
      const actor = await createSplitDappActor();
      const senderPrincipal = typeof transaction.from === "string" ? Principal.fromText(transaction.from) : transaction.from;
      const principalStr = typeof principal === "string" ? principal : principal.toText();
      const recipientEntry = transaction.to.find((entry) => String(entry.principal) === principalStr);
      
      if (!recipientEntry) {
        toast.error('Recipient entry not found.');
        return;
      }
      
      const recipientPrincipal = typeof recipientEntry.principal === "string"
        ? Principal.fromText(recipientEntry.principal)
        : recipientEntry.principal;

      // Get the sender's transactions to find the correct index
      const senderPrincipalStr = typeof transaction.from === "string" ? transaction.from : (transaction.from as { toText: () => string }).toText();
      const txs = await actor.getTransactionsPaginated(Principal.fromText(senderPrincipalStr), BigInt(0), BigInt(100)) as { transactions: unknown[] };
      const txIndex = txs.transactions.findIndex((t: unknown) => (t as { id: string }).id === transaction.id);

      if (txIndex === -1) {
        toast.error('Transaction not found.');
        return;
      }

      await actor.recipientDeclineEscrow(senderPrincipal, txIndex, recipientPrincipal);
      toast.success("Escrow declined!");
      
      // Fetch updated transaction and update state
      const updated = await actor.getTransaction(transaction.id, principal);
      if (Array.isArray(updated) && updated.length > 0) {
        const serializedUpdated = {
          ...updated[0],
          timestamp: updated[0].createdAt?.toString() || "0",
          createdAt: updated[0].createdAt?.toString() || "0",
          confirmedAt: updated[0].confirmedAt ? updated[0].confirmedAt.toString() : undefined,
          cancelledAt: updated[0].cancelledAt ? updated[0].cancelledAt.toString() : undefined,
          refundedAt: updated[0].refundedAt ? updated[0].refundedAt.toString() : undefined,
          releasedAt: updated[0].releasedAt ? updated[0].releasedAt.toString() : undefined,
          readAt: updated[0].readAt ? updated[0].readAt.toString() : undefined,
          to: Array.isArray(updated[0].to) ? updated[0].to.map((toEntry: ApiToEntry) => ({
            ...toEntry,
            approvedAt: toEntry.approvedAt ? toEntry.approvedAt.toString() : undefined,
            declinedAt: toEntry.declinedAt ? toEntry.declinedAt.toString() : undefined,
            readAt: toEntry.readAt ? toEntry.readAt.toString() : undefined,
          })) : []
        };
        setTransaction(serializedUpdated);
      }
    } catch (err) {
      console.error("Decline error:", err);
      toast.error("Failed to decline escrow");
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
  if (statusKey === TRANSACTION_STATUS.RELEASED) currentStep = 3;
  else if (statusKey === TRANSACTION_STATUS.CONFIRMED) currentStep = 2;
  else if (statusKey === TRANSACTION_STATUS.PENDING) currentStep = 1;
  else if (statusKey === TRANSACTION_STATUS.CANCELLED) currentStep = 0;
  else if (statusKey === TRANSACTION_STATUS.REFUND) currentStep = 0;

  const totalBTC = Array.isArray(transaction.to)
    ? transaction.to.reduce((sum: number, toEntry) => sum + Number(toEntry.amount), 0) / 1e8
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="self-start">
          <ChevronLeft /> Back to dashboard
        </Button>
        <TimeRemaining createdAt={transaction.createdAt} />
      </div>

      <AnimatePresence>
        {statusKey === TRANSACTION_STATUS.RELEASED && (
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
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1">

          {statusKey === TRANSACTION_STATUS.RELEASED && (
            <ReleasedEscrowDetails transaction={transaction} />
          )}

          {statusKey === TRANSACTION_STATUS.PENDING && (
            (() => {
              const isSender = principal && String(transaction.from) === String(principal);
              const transactionData = {
                id: transaction.id,
                status: "pending" as const,
                title: transaction.title,
                from: typeof transaction.from === "string" ? transaction.from : (transaction.from as PrincipalLike)?.toText?.() || String(transaction.from),
                createdAt: typeof transaction.createdAt === "string" ? transaction.createdAt : String(transaction.createdAt),
                to: Array.isArray(transaction.to)
                  ? transaction.to.map((toEntry: ApiToEntry) => ({
                      principal: typeof toEntry.principal === "string" ? toEntry.principal : (toEntry.principal as PrincipalLike)?.toText?.() || String(toEntry.principal),
                      amount: BigInt(String(toEntry.amount)),
                      percentage: Number(String(toEntry.percentage)),
                      status: toEntry.status as { [key: string]: null },
                      name: toEntry.name,
                      approvedAt: toEntry.approvedAt ? String(toEntry.approvedAt) : undefined,
                      declinedAt: toEntry.declinedAt ? String(toEntry.declinedAt) : undefined,
                      readAt: toEntry.readAt ? String(toEntry.readAt) : undefined,
                    }))
                  : [],
                releasedAt: Array.isArray(transaction.releasedAt)
                  ? (transaction.releasedAt.length > 0 ? String(transaction.releasedAt[0]) : undefined)
                  : transaction.releasedAt ? String(transaction.releasedAt) : undefined,
                bitcoinAddress: Array.isArray(transaction.bitcoinAddress)
                  ? (transaction.bitcoinAddress.length > 0 ? String(transaction.bitcoinAddress[0]) : undefined)
                  : transaction.bitcoinAddress ? String(transaction.bitcoinAddress) : undefined,
                bitcoinTransactionHash: Array.isArray(transaction.bitcoinTransactionHash)
                  ? (transaction.bitcoinTransactionHash.length > 0 ? String(transaction.bitcoinTransactionHash[0]) : undefined)
                  : transaction.bitcoinTransactionHash ? String(transaction.bitcoinTransactionHash) : undefined
              };

              return isSender ? (
                <EditEscrowDetails
                  transaction={transactionData}
                  onCancel={handleCancel}
                  onEdit={handleEdit}
                />
              ) : (
                <PendingEscrowDetails
                  transaction={transactionData}
                  onCancel={undefined}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                />
              );
            })()
          )}

          {(statusKey === TRANSACTION_STATUS.CANCELLED || statusKey === TRANSACTION_STATUS.DECLINED) && (
            <CancelledEscrowDetails
              transaction={{
                ...transaction,
                from: typeof transaction.from === "string" ? transaction.from : (transaction.from as PrincipalLike)?.toText?.() || String(transaction.from),
                to: Array.isArray(transaction.to)
                  ? transaction.to.map((toEntry: ApiToEntry) => ({
                    ...toEntry,
                    principal: typeof toEntry.principal === "string" ? toEntry.principal : (toEntry.principal as PrincipalLike)?.toText?.() || String(toEntry.principal),
                    amount: String(toEntry.amount),
                    percentage: String(toEntry.percentage),
                    status: toEntry.status,
                    name: toEntry.name,
                    approvedAt: toEntry.approvedAt ? String(toEntry.approvedAt) : undefined,
                    declinedAt: toEntry.declinedAt ? String(toEntry.declinedAt) : undefined,
                    readAt: toEntry.readAt ? String(toEntry.readAt) : undefined,
                  }))
                  : [],
                status: statusKey,
                releasedAt: Array.isArray(transaction.releasedAt)
                  ? (transaction.releasedAt.length > 0 ? String(transaction.releasedAt[0]) : undefined)
                  : transaction.releasedAt ? String(transaction.releasedAt) : undefined,
                bitcoinAddress: Array.isArray(transaction.bitcoinAddress)
                  ? (transaction.bitcoinAddress.length > 0 ? String(transaction.bitcoinAddress[0]) : undefined)
                  : transaction.bitcoinAddress ? String(transaction.bitcoinAddress) : undefined,
                bitcoinTransactionHash: Array.isArray(transaction.bitcoinTransactionHash)
                  ? (transaction.bitcoinTransactionHash.length > 0 ? String(transaction.bitcoinTransactionHash[0]) : undefined)
                  : transaction.bitcoinTransactionHash ? String(transaction.bitcoinTransactionHash) : undefined
              }}
            />
          )}

          {statusKey === TRANSACTION_STATUS.REFUND && (
            <RefundedEscrowDetails
              transaction={{
                ...transaction,
                from: typeof transaction.from === "string" ? transaction.from : (transaction.from as PrincipalLike)?.toText?.() || String(transaction.from),
                to: Array.isArray(transaction.to)
                  ? transaction.to.map((toEntry: ApiToEntry) => ({
                    ...toEntry,
                    principal: typeof toEntry.principal === "string" ? toEntry.principal : (toEntry.principal as PrincipalLike)?.toText?.() || String(toEntry.principal),
                    amount: String(toEntry.amount),
                    percentage: String(toEntry.percentage),
                    status: toEntry.status,
                    name: toEntry.name,
                    approvedAt: toEntry.approvedAt ? String(toEntry.approvedAt) : undefined,
                    declinedAt: toEntry.declinedAt ? String(toEntry.declinedAt) : undefined,
                    readAt: toEntry.readAt ? String(toEntry.readAt) : undefined,
                  }))
                  : [],
                status: "refund",
                releasedAt: Array.isArray(transaction.releasedAt)
                  ? (transaction.releasedAt.length > 0 ? String(transaction.releasedAt[0]) : undefined)
                  : transaction.releasedAt ? String(transaction.releasedAt) : undefined,
                bitcoinAddress: Array.isArray(transaction.bitcoinAddress)
                  ? (transaction.bitcoinAddress.length > 0 ? String(transaction.bitcoinAddress[0]) : undefined)
                  : transaction.bitcoinAddress ? String(transaction.bitcoinAddress) : undefined,
                bitcoinTransactionHash: Array.isArray(transaction.bitcoinTransactionHash)
                  ? (transaction.bitcoinTransactionHash.length > 0 ? String(transaction.bitcoinTransactionHash[0]) : undefined)
                  : transaction.bitcoinTransactionHash ? String(transaction.bitcoinTransactionHash) : undefined
              }}
            />
          )}

          {statusKey === TRANSACTION_STATUS.CONFIRMED && (
            (() => {
              const isSender = principal && String(transaction.from) === String(principal);
              return isSender ? (
                <ConfirmedEscrowActions
                  transaction={transaction}
                  isLoading={isLoading}
                  onRelease={handleRelease}
                  onRefund={handleRefund}
                />
              ) : (
                <div className="container !rounded-2xl !p-6">
                  <Typography variant="large" className="mb-4">Escrow overview</Typography>
                  <TransactionStats
                    totalBTC={Array.isArray(transaction.to)
                      ? transaction.to.reduce((sum: number, toEntry) => sum + Number(toEntry.amount), 0) / 1e8
                      : 0}
                    recipientCount={transaction.to?.length || 0}
                    status={transaction.status}
                  />
                  <hr className="my-6 text-[#424444] h-[1px]" />
                  <div className="text-center py-8">
                    <Typography variant="base" className="text-[#9F9F9F]">
                      Waiting for sender to release or refund the escrow...
                    </Typography>
                  </div>
                </div>
              );
            })()
          )}
        </div>

        <TransactionLifecycle currentStep={currentStep} />


      </div>
    </div>
  );
}
