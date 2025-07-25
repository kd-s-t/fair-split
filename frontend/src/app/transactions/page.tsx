"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import type { Transaction } from "@/declarations/split_dapp.did";
import { motion } from "framer-motion";
import {
  markAllAsRead,
} from "../../lib/redux/transactionsSlice";
import { useRouter } from "next/navigation";
import { Principal } from "@dfinity/principal";
import { Typography } from "@/components/ui/typography";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bitcoin,
  Eye,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { statusMap } from "@/components/RecentActivities";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { toast } from "sonner";
import { setTitle, setSubtitle } from '../../lib/redux/store';
import { useDispatch } from "react-redux";

export default function TransactionsPage() {
  const { principal } = useAuth();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setTitle('Transaction history'));
    dispatch(setSubtitle('View all your escrow transactions'));
  }, [dispatch]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localTransactions, setLocalTransactions] = useState<any[]>([]);
  const router = useRouter();
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!principal || localTransactions.length) return;
      setIsLoading(true);
      setError(null);
      try {
        const actor = await createSplitDappActor();
        const txs = await actor.getTransactions(principal);
        const pendingApprovals = await actor.getPendingApprovalsForRecipient(
          principal
        );
        // Normalize all principal fields to strings for both txs and pendingApprovals
        function normalizeTx(tx: any) {
          return {
            ...tx,
            from:
              tx.from &&
              typeof tx.from === "object" &&
              typeof tx.from.toText === "function"
                ? tx.from.toText()
                : String(tx.from),
            timestamp:
              typeof tx.timestamp === "bigint"
                ? tx.timestamp.toString()
                : tx.timestamp,
            to: tx.to.map((toEntry: any) => ({
              ...toEntry,
              principal:
                toEntry.principal &&
                typeof toEntry.principal === "object" &&
                typeof toEntry.principal.toText === "function"
                  ? toEntry.principal.toText()
                  : String(toEntry.principal),
              amount:
                typeof toEntry.amount === "bigint"
                  ? toEntry.amount.toString()
                  : toEntry.amount,
            })),
          };
        }
        const allTxs = ([...(txs as any[]), ...(pendingApprovals as any[])]).map(normalizeTx);
        console.log("allTxs:", allTxs);
        setLocalTransactions(allTxs);
      } catch (err: any) {
        setError(err.message || "Failed to fetch transactions");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [principal, localTransactions.length]);

  function getTxId(tx: any) {
    return `${tx.from}_${tx.to
      .map((toEntry: any) => toEntry.principal)
      .join("-")}_${tx.timestamp}`;
  }

  // Helper to determine if tx is pending approval for the current user
  function isPendingApproval(tx: any): boolean {
    if (!principal) return false;
    return tx.to.some(
      (toEntry: any) =>
        String(toEntry.principal) === String(principal) &&
        toEntry.status &&
        Object.keys(toEntry.status)[0] === "pending"
    );
  }
  // Helper to determine if tx is sent by the user
  function isSentByUser(tx: any): boolean {
    return String(tx.from) === String(principal);
  }

  async function handleApprove(tx: any, idx: number) {
    if (!principal) return;
    setIsApproving(getTxId(tx));
    try {
      const actor = await createSplitDappActor();
      const senderPrincipal = typeof tx.from === "string" ? Principal.fromText(tx.from) : tx.from;
      // Always compare principal as string
      const principalStr = typeof principal === "string" ? principal : principal.toText();
      const recipientEntry = tx.to.find((entry: any) => entry.principal === principalStr);
      if (!recipientEntry) {
        toast.error('Recipient entry not found.');
        setIsApproving(null);
        return;
      }
      const recipientPrincipal = typeof recipientEntry.principal === "string"
        ? Principal.fromText(recipientEntry.principal)
        : recipientEntry.principal;
      await actor.recipientApproveEscrow(senderPrincipal, idx, recipientPrincipal);
      toast.success('Approved successfully!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve');
      setIsApproving(null);
    }
  }

  async function handleDecline(tx: any, idx: number) {
    if (!principal) return;
    const actor = await createSplitDappActor();
    const senderPrincipal =
      typeof tx.from === "string" ? Principal.fromText(tx.from) : tx.from;
    // Always compare principal as string
    const principalStr =
      typeof principal === "string" ? principal : principal.toText();
    const recipientEntry = tx.to.find(
      (entry: any) => entry.principal === principalStr
    );
    if (!recipientEntry) {
      alert("Recipient entry not found.");
      return;
    }
    const recipientPrincipal =
      typeof recipientEntry.principal === "string"
        ? Principal.fromText(recipientEntry.principal)
        : recipientEntry.principal;

    await actor.recipientDeclineEscrow(
      senderPrincipal,
      idx,
      recipientPrincipal
    );
    window.location.reload();
  }

  async function handleRelease() {
    if (!principal) return;
    setIsReleasing(true);
    try {
      const actor = await createSplitDappActor();
      await actor.releaseSplit(principal);
      toast.success("Escrow released!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      toast.error(err.message || "Failed to release escrow");
    } finally {
      setIsReleasing(false);
    }
  }

  async function handleRowClick(tx: Transaction, idx: number) {
    if (!principal) return;
    if (!tx.isRead) {
      const actor = await createSplitDappActor();
      await actor.markTransactionsAsRead(principal);
      dispatch(markAllAsRead());
    }
    // Navigate to the transaction details page using index-sender
    router.push(`/transactions/${idx}-${tx.from}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isLoading && (
        <div className="text-center">
          <div className="flex flex-col gap-2 items-center">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-full max-w-3xl h-10 bg-gray-200 animate-pulse rounded"
              />
            ))}
          </div>
        </div>
      )}
      {error && <div className="text-red-500 text-center">{error}</div>}
      {!isLoading && !error && localTransactions.length === 0 && (
        <>
          <div className="text-center text-muted-foreground">No transactions found.</div>
        </>
      )}
      {!isLoading && !error && localTransactions.length > 0 && (
        <>
          {console.log("Rendering table with transactions:", localTransactions)}
          <div className="space-y-4">
            {localTransactions.map((tx: any, idx: number) => {
              const pendingApproval = isPendingApproval(tx);

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-[#222222] rounded-2xl px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between border border-[#303434] shadow-sm"
                  onClick={
                    pendingApproval ? undefined : () => handleRowClick(tx, idx)
                  }
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Typography variant="large" className="text-xl">
                            {tx.title}
                          </Typography>
                            
                          {(() => {
                          const statusKey =
                            typeof tx.status === "object" &&
                            tx.status !== null
                              ? Object.keys(tx.status)[0]
                              : tx.status;
                          return (
                            <Badge
                              variant={
                                (statusMap[statusKey]?.variant ?? "default") as
                                  | "secondary"
                                  | "success"
                                  | "primary"
                                  | "error"
                                  | "default"
                                  | "outline"
                                  | "warning"
                              }
                              className="text-xs"
                            >
                              {statusMap[statusKey]?.label || statusKey}
                            </Badge>
                          );
                        })()}
                        </div>
                        <div className="flex items-center gap-2 text-xs mb-2">
                          <Typography
                            variant="small"
                            className="text-[#9F9F9F]"
                          >
                            {tx.date}
                          </Typography>
                          {tx.category === "sent" ||
                          tx.category === "pending" ? (
                            <div className="flex items-center gap-1 text-[#007AFF]">
                              <ArrowUpRight size={14} />
                              <Typography
                                variant="muted"
                                className="!text-[#007AFF]"
                              >
                                Sent
                              </Typography>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[#00C287]">
                              <ArrowDownLeft size={14} />
                              <Typography
                                variant="muted"
                                className="!text-[#00C287]"
                              >
                                Receiving
                              </Typography>
                            </div>
                          )}
                        </div>
                      </div>

                      {tx.category === "sent" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-medium border-[#7A7A7A] gap-1"
                        >
                          <Wallet /> Manage escrow
                        </Button>
                      )}

                      {tx.category === "received" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-medium border-[#7A7A7A] gap-1"
                        >
                          <Eye /> View escrow
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 mt-2">
                      <div>
                        <Typography variant="small" className="text-[#9F9F9F]">
                          Amount
                        </Typography>
                        <div className="flex items-center gap-1">
                          <Bitcoin size={16} color="#F97415" />
                          <Typography variant="base" className="font-semibold">
                            {tx.to && Array.isArray(tx.to)
                              ? (tx.to.reduce((sum: number, toEntry: any) => sum + Number(toEntry.amount), 0) / 1e8).toFixed(8)
                              : '0.00000000'} BTC
                          </Typography>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Typography variant="small" className="text-[#9F9F9F]">
                          To
                        </Typography>
                        <Typography variant="base" className="font-semibold">
                          {tx.to.length} recipient
                          {tx.to.length !== 1 ? "s" : ""}
                        </Typography>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Typography variant="small" className="text-[#9F9F9F]">
                          Transaction hash
                        </Typography>
                        <Typography
                          variant="base"
                          className="font-semibold text-[#FEB64D]"
                        >
                          ffxxxxgggggg
                        </Typography>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}
