"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import type { Transaction } from "@/declarations/split_dapp.did";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { markAllAsRead } from '../../lib/redux/transactionsSlice';
import { useRouter } from "next/navigation";
import { Principal } from "@dfinity/principal";
import { toast } from "sonner";

export default function TransactionsPage() {
  const { principal } = useAuth();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localTransactions, setLocalTransactions] = useState<any[]>([]);
  const router = useRouter();
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!principal || localTransactions.length) return;
      setIsLoading(true);
      setError(null);
      try {
        const actor = await createSplitDappActor();
        const txs = await actor.getTransactions(principal);
        const pendingApprovals = await actor.getPendingApprovalsForRecipient(principal);
        function normalizeTx(tx: any) {
          return {
            ...tx,
            from: tx.from && typeof tx.from === 'object' && typeof tx.from.toText === 'function' ? tx.from.toText() : String(tx.from),
            timestamp: typeof tx.timestamp === 'bigint' ? tx.timestamp.toString() : tx.timestamp,
            to: tx.to.map((toEntry: any) => ({
              ...toEntry,
              principal: toEntry.principal && typeof toEntry.principal === 'object' && typeof toEntry.principal.toText === 'function'
                ? toEntry.principal.toText()
                : String(toEntry.principal),
              amount: typeof toEntry.amount === 'bigint' ? toEntry.amount.toString() : toEntry.amount,
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
    return `${tx.from}_${tx.to.map((toEntry: any) => toEntry.principal).join('-')}_${tx.timestamp}`;
  }

  // Helper to determine if tx is pending approval for the current user
  function isPendingApproval(tx: any): boolean {
    if (!principal) return false;
    return tx.to.some((toEntry: any) =>
      String(toEntry.principal) === String(principal) &&
      toEntry.status &&
      Object.keys(toEntry.status)[0] === 'pending'
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

  async function handleDecline(tx: any,idx:number) {
    if (!principal) return;
    const actor = await createSplitDappActor();
    const senderPrincipal = typeof tx.from === "string" ? Principal.fromText(tx.from) : tx.from;
    // Always compare principal as string
    const principalStr = typeof principal === "string" ? principal : principal.toText();
    const recipientEntry = tx.to.find((entry: any) => entry.principal === principalStr);
    if (!recipientEntry) {
      alert('Recipient entry not found.');
      return;
    }
    const recipientPrincipal = typeof recipientEntry.principal === "string"
      ? Principal.fromText(recipientEntry.principal)
      : recipientEntry.principal;

    await actor.recipientDeclineEscrow(senderPrincipal, idx, recipientPrincipal);
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

  async function handleRefund() {
    if (!principal) return;
    setIsRefunding(true);
    try {
      const actor = await createSplitDappActor();
      await actor.cancelSplit(principal);
      toast.success("Escrow refunded!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      toast.error(err.message || "Failed to refund escrow");
    } finally {
      setIsRefunding(false);
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
      className="max-w-3xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">Transactions</h1>
      {isLoading && (
        <div className="text-center">
          <div className="flex flex-col gap-2 items-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full max-w-3xl h-10 bg-gray-200 animate-pulse rounded" />
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
          <Table className="rounded-xl overflow-hidden border border-slate-200 shadow-md bg-white">
            <TableHeader>
              <TableRow className="bg-slate-800 text-white">
                <TableHead className="p-3 text-left">From</TableHead>
                <TableHead className="p-3 text-left">To</TableHead>
                <TableHead className="p-3 text-right">Amount</TableHead>
                <TableHead className="p-3 text-right">Date</TableHead>
                <TableHead className="p-3 text-right">Status</TableHead>
                <TableHead className="p-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localTransactions
                .map((tx: any, idx: number) => {
                  const pendingApproval = isPendingApproval(tx);
                  // Use tx.idx if present, otherwise fallback to idx
                  const txIndex = tx.idx !== undefined ? tx.idx : idx;
                  return (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className={
                        pendingApproval
                          ? "bg-blue-900/70 border-l-4 border-blue-400 text-blue-100"
                          : isSentByUser(tx)
                            ? `hover:bg-yellow-800 transition-colors ${!tx.isRead ? 'bg-yellow-900 text-yellow-200' : ''} cursor-pointer`
                            : "bg-slate-900 text-slate-200"
                      }
                      onClick={pendingApproval ? undefined : () => handleRowClick(tx,idx)}
                    >
                      <TableCell className={pendingApproval ? "p-4 font-mono text-xs" : "p-3 font-mono text-xs"}>{tx.from}</TableCell>
                      <TableCell className={pendingApproval ? "p-4 font-mono text-xs" : "p-3 font-mono text-xs"}>{tx.to.map((toEntry: any) => toEntry.principal).join(', ')}</TableCell>
                      <TableCell className={pendingApproval ? "p-4 text-right font-semibold text-blue-300" : "p-3 text-right font-semibold text-yellow-600"}>{tx.to.reduce((sum: number, toEntry: any) => sum + Number(toEntry.amount), 0) / 1e8}</TableCell>
                      <TableCell className={pendingApproval ? "p-4 text-right text-xs" : "p-3 text-right text-xs"}>{new Date(Number(tx.timestamp) / 1_000_000).toLocaleString()}</TableCell>
                      <TableCell className={pendingApproval ? "p-4 text-right text-blue-300 font-bold" : "p-3 text-right text-xs"}>
                        {pendingApproval ? "Pending your approval" : (tx.status ? Object.keys(tx.status)[0] : 'unknown')}
                      </TableCell>
                      <TableCell className={pendingApproval ? "p-4 text-right flex gap-2 justify-end" : "p-3 text-right"}>
                        {pendingApproval ? (
                          <>
                            <button
                              className={`bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded shadow transition cursor-pointer ${isApproving === getTxId(tx) ? 'opacity-60 cursor-not-allowed' : ''}`}
                              onClick={() => handleApprove(tx, txIndex)}
                              disabled={isApproving === getTxId(tx)}
                            >
                              {isApproving === getTxId(tx) ? (
                                <span className="flex items-center gap-2">
                                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                                  Approving...
                                </span>
                              ) : (
                                'Approve'
                              )}
                            </button>
                            <button
                              className={`bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded shadow transition cursor-pointer ${isApproving === getTxId(tx) ? 'opacity-60 cursor-not-allowed' : ''}`}
                              onClick={() => handleDecline(tx, txIndex)}
                              disabled={isApproving === getTxId(tx)}
                            >
                              Decline
                            </button>
                          </>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </motion.tr>
                  );
                })}
            </TableBody>
          </Table>
        </>
      )}
    </motion.div>
  );
} 