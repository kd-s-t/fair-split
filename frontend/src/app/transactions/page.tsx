"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import type { NormalizedTransaction } from "@/modules/transactions/types";
import { motion } from "framer-motion";

// Helper function to convert API response to NormalizedTransaction[]
const convertToNormalizedTransactions = (transactions: unknown[]): NormalizedTransaction[] => {
  return transactions.map((tx: unknown) => {
    const txObj = tx as Record<string, unknown>;
    return {
      id: txObj.id as string,
      status: txObj.status as string,
      title: txObj.title as string,
      from: typeof txObj.from === "string" ? txObj.from : (txObj.from as { toText: () => string }).toText(),
      createdAt: typeof txObj.createdAt === "bigint" ? txObj.createdAt.toString() : String(txObj.createdAt),
      confirmedAt: Array.isArray(txObj.confirmedAt) && txObj.confirmedAt.length > 0 ? txObj.confirmedAt[0].toString() : undefined,
      cancelledAt: Array.isArray(txObj.cancelledAt) && txObj.cancelledAt.length > 0 ? txObj.cancelledAt[0].toString() : undefined,
      refundedAt: Array.isArray(txObj.refundedAt) && txObj.refundedAt.length > 0 ? txObj.refundedAt[0].toString() : undefined,
      releasedAt: Array.isArray(txObj.releasedAt) && txObj.releasedAt.length > 0 ? txObj.releasedAt[0].toString() : undefined,
      readAt: Array.isArray(txObj.readAt) && txObj.readAt.length > 0 ? txObj.readAt[0].toString() : undefined,
      bitcoinTransactionHash: Array.isArray(txObj.bitcoinTransactionHash) && txObj.bitcoinTransactionHash.length > 0 ? txObj.bitcoinTransactionHash[0] : txObj.bitcoinTransactionHash,
      bitcoinAddress: Array.isArray(txObj.bitcoinAddress) && txObj.bitcoinAddress.length > 0 ? txObj.bitcoinAddress[0] : txObj.bitcoinAddress,
      to: (txObj.to as unknown[]).map((toEntry: unknown) => {
        const entry = toEntry as Record<string, unknown>;
        return {
          principal: entry.principal && typeof entry.principal === "object" && typeof (entry.principal as { toText: () => string }).toText === "function"
            ? (entry.principal as { toText: () => string }).toText()
            : String(entry.principal),
          amount: typeof entry.amount === "bigint" ? entry.amount.toString() : String(entry.amount),
          percentage: typeof entry.percentage === "bigint" ? entry.percentage.toString() : String(entry.percentage),
          status: entry.status as unknown,
          name: entry.name as string,
          approvedAt: Array.isArray(entry.approvedAt) && entry.approvedAt.length > 0 ? entry.approvedAt[0].toString() : undefined,
          declinedAt: Array.isArray(entry.declinedAt) && entry.declinedAt.length > 0 ? entry.declinedAt[0].toString() : undefined,
          readAt: Array.isArray(entry.readAt) && entry.readAt.length > 0 ? entry.readAt[0].toString() : undefined,
        };
      }),
    };
  });
};
import {
  markAllAsRead,
  setTransactions,
} from "../../lib/redux/transactionsSlice";
import { useRouter } from "next/navigation";
import { Principal } from "@dfinity/principal";
import { Typography } from "@/components/ui/typography";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bitcoin,
  RotateCw,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { statusMap } from "@/modules/dashboard/Activities";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { setTitle, setSubtitle } from '../../lib/redux/store';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

export default function TransactionsPage() {
  const { principal } = useAuth();
  const dispatch = useDispatch();
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  console.log("transactions", transactions);
  useEffect(() => {
    dispatch(setTitle('Transaction history'));
    dispatch(setSubtitle('View all your escrow transactions'));
  }, [dispatch]);

  const [localTransactions, setLocalTransactions] = useState<NormalizedTransaction[]>([]);
  const router = useRouter();

  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isDeclining, setIsDeclining] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const refreshIconRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const sorted = [...transactions].sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
      setLocalTransactions(sorted);
    }
  }, [transactions]);

  const availableCategories = Array.from(new Set(localTransactions.map(tx => getTransactionCategory(tx))));
  const availableStatuses = Array.from(new Set(localTransactions.map(tx => tx.status)));

  // Function to mark unread transactions as read for the current recipient
  const markUnreadTransactionsAsRead = useCallback(async () => {
    if (!principal) return;
    
    // Find transactions where current user is a recipient and hasn't read them
    const unreadTransactionIds = localTransactions
      .filter(tx => {
        // Check if user is a recipient in this transaction
        const recipientEntry = tx.to.find((entry) => 
          String(entry.principal) === String(principal)
        );
        
        // Return true if user is a recipient and hasn't read the transaction
        return recipientEntry && (recipientEntry.readAt === null || Array.isArray(recipientEntry.readAt) && recipientEntry.readAt.length === 0);
      })
      .map(tx => tx.id);
    
    if (unreadTransactionIds.length > 0) {
      try {
        const actor = await createSplitDappActor();
        await actor.recipientMarkAsReadBatch(unreadTransactionIds, principal);
        console.log(`Marked ${unreadTransactionIds.length} transactions as read`, unreadTransactionIds);
      } catch (error) {
        console.error('Failed to mark transactions as read:', error);
      }
    }
  }, [localTransactions, principal]);

  // Mark unread transactions as read when transactions are loaded
  useEffect(() => {
    if (localTransactions.length > 0 && principal) {
      markUnreadTransactionsAsRead();
    }
  }, [localTransactions, principal, markUnreadTransactionsAsRead]);

  function truncateHash(hash: string): string {
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  }

  function getTxId(tx: NormalizedTransaction) {
    return `${tx.from}_${tx.to
      .map((toEntry) => toEntry.principal)
      .join("-")}_${tx.createdAt}`;
  }

  function isPendingApproval(tx: NormalizedTransaction): boolean {
    if (!principal) return false;
    return tx.to.some(
      (toEntry) =>
        String(toEntry.principal) === String(principal) &&
        toEntry.status &&
        Object.keys(toEntry.status)[0] === "pending"
    );
  }

  function hasUserApproved(tx: NormalizedTransaction): boolean {
    if (!principal) return false;
    return tx.to.some(
      (toEntry) =>
        String(toEntry.principal) === String(principal) &&
        toEntry.status &&
        Object.keys(toEntry.status)[0] === "approved"
    );
  }

  function hasUserDeclined(tx: NormalizedTransaction): boolean {
    if (!principal) return false;
    return tx.to.some(
      (toEntry) =>
        String(toEntry.principal) === String(principal) &&
        toEntry.status &&
        Object.keys(toEntry.status)[0] === "declined"
    );
  }

  function isSentByUser(tx: NormalizedTransaction): boolean {
    return String(tx.from) === String(principal);
  }

  function getTransactionCategory(tx: NormalizedTransaction): "sent" | "received" {
    return isSentByUser(tx) ? "sent" : "received";
  }

  async function handleApprove(tx: NormalizedTransaction) {
    if (!principal) return;
    setIsApproving(getTxId(tx));
    try {
      const actor = await createSplitDappActor();
      const senderPrincipal = typeof tx.from === "string" ? Principal.fromText(tx.from) : tx.from;
      // Always compare principal as string
      const principalStr = typeof principal === "string" ? principal : principal.toText();
      const recipientEntry = tx.to.find((entry) => String(entry.principal) === principalStr);
      if (!recipientEntry) {
        toast.error('Recipient entry not found.');
        setIsApproving(null);
        return;
      }
      const recipientPrincipal = typeof recipientEntry.principal === "string"
        ? Principal.fromText(recipientEntry.principal)
        : recipientEntry.principal;
      
      await actor.recipientApproveEscrow(senderPrincipal, tx.id, recipientPrincipal);
      toast.success('Approved successfully!');
      // Refresh transaction data
      const updatedTxs = await actor.getTransactionsPaginated(principal, BigInt(0), BigInt(100)) as { transactions: unknown[] };
      dispatch(setTransactions(convertToNormalizedTransactions(updatedTxs.transactions)));
    } catch (err) {
      toast.error((err as Error).message || 'Failed to approve');
      setIsApproving(null);
    }
  }

  async function handleDecline(tx: NormalizedTransaction) {
    if (!principal) return;
    setIsDeclining(getTxId(tx));
    try {
      const actor = await createSplitDappActor();
      const senderPrincipal =
        typeof tx.from === "string" ? Principal.fromText(tx.from) : tx.from;
      const principalStr =
        typeof principal === "string" ? principal : principal.toText();
      const recipientEntry = tx.to.find(
        (entry) => String(entry.principal) === principalStr
      );
      if (!recipientEntry) {
        toast.error("Recipient entry not found.");
        setIsDeclining(null);
        return;
      }
      const recipientPrincipal =
        typeof recipientEntry.principal === "string"
          ? Principal.fromText(recipientEntry.principal)
          : recipientEntry.principal;

      // Get the sender's transactions to find the correct index
      const senderPrincipalStr = tx.from;
      const txs = await actor.getTransactionsPaginated(Principal.fromText(senderPrincipalStr), BigInt(0), BigInt(100)) as { transactions: unknown[] };
      const txIndex = txs.transactions.findIndex((t) => (t as { id: string }).id === tx.id);
      
      if (txIndex === -1) {
        toast.error('Transaction not found.');
        setIsDeclining(null);
        return;
      }

      await actor.recipientDeclineEscrow(
        senderPrincipal,
        txIndex,
        recipientPrincipal
      );
      toast.success('Declined successfully!');
      // Refresh transaction data
      const updatedTxs = await actor.getTransactionsPaginated(principal, BigInt(0), BigInt(100)) as { transactions: unknown[] };
      dispatch(setTransactions(convertToNormalizedTransactions(updatedTxs.transactions)));
    } catch (err) {
      toast.error((err as Error).message || 'Failed to decline');
      setIsDeclining(null);
    }
  }

  async function handleRowClick(tx: NormalizedTransaction) {
    if (!principal) return;
    const actor = await createSplitDappActor();
    await actor.markTransactionsAsRead(principal);
    dispatch(markAllAsRead());
    router.push(`/transactions/${tx.id}`);
  }

  const filteredTransactions = localTransactions.filter(tx => {
    const matchesSearch = tx.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const currentTransactions = filteredTransactions;

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    if (!principal) return;
    setRefreshing(true);
    try {
      const actor = await createSplitDappActor();
      const result = await actor.getTransactionsPaginated(principal, BigInt(0), BigInt(100)) as { transactions: unknown[] };
      dispatch(setTransactions(convertToNormalizedTransactions(result.transactions)));
      toast.success('Transactions refreshed!');
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
      toast.error('Failed to refresh transactions');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      {/* Search, Filter Section, and Refresh Icon in the same row */}
      <div className="flex items-center gap-4 mb-6 w-full">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search transactions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-[#222222] border border-[#303434] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#FEB64D]"
          />
        </div>
        <div className="w-1/5">
          <select className="w-full px-4 py-2 bg-[#222222] border border-[#303434] rounded-lg text-white focus:outline-none focus:border-[#FEB64D]">
            <option value="all">All transactions</option>
            {availableCategories.includes('sent') && <option value="sent">Sent</option>}
            {availableCategories.includes('received') && <option value="received">Received</option>}
          </select>
        </div>
        <div className="w-1/5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 bg-[#222222] border border-[#303434] rounded-lg text-white focus:outline-none focus:border-[#FEB64D]"
          >
            <option value="all">All status</option>
            {availableStatuses.includes('pending') && <option value="pending">Pending</option>}
            {availableStatuses.includes('confirmed') && <option value="confirmed">Confirmed</option>}
            {availableStatuses.includes('released') && <option value="released">Released</option>}
            {availableStatuses.includes('cancelled') && <option value="cancelled">Cancelled</option>}
            {availableStatuses.includes('declined') && <option value="declined">Declined</option>}
          </select>
        </div>
        {/* Refresh icon at the end */}
        <div className="flex items-center ml-4 min-w-[40px]">
          <button
            ref={refreshIconRef}
            onClick={fetchTransactions}
            className="p-2 rounded-full hover:bg-[#2a2a2a] transition-colors"
            aria-label="Refresh"
            disabled={refreshing}
          >
            <RotateCw className={`h-5 w-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Show 'No transactions found.' below filters if there are no transactions */}
        {localTransactions.length === 0 && (
          <div className="text-center text-muted-foreground mb-4">No transactions found.</div>
        )}

        {/* Only show transaction count and list if there are transactions */}
        {localTransactions.length > 0 && (
          <>
            <div className="text-sm text-gray-400 mb-4">
              Showing {currentTransactions.length} of {localTransactions.length} transactions
            </div>

            <div className="space-y-4">
              {currentTransactions.map((tx, idx: number) => {
                const pendingApproval = isPendingApproval(tx);
                const isRowClickable = !pendingApproval && getTransactionCategory(tx) === "sent";

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`bg-[#222222] rounded-2xl px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between border border-[#303434] shadow-sm ${!pendingApproval || getTransactionCategory(tx) === "sent" ? 'hover:bg-[#2a2a2a] transition-colors' : ''}`}
                    onClick={isRowClickable ? () => handleRowClick(tx) : undefined}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Typography variant="large" className="text-xl">
                              {tx.title}
                            </Typography>

                            {(() => {
                              const statusKey = tx.status;
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
                              {new Date(Number(tx.createdAt) / 1_000_000).toLocaleString()}
                            </Typography>
                            {getTransactionCategory(tx) === "sent" ? (
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
                            {((tx.status === 'pending' || tx.status === 'confirmed') && 
                              !isSentByUser(tx) && hasUserApproved(tx)) && (
                              <Typography
                                variant="small"
                                className="text-[#9F9F9F] ml-2"
                              >
                                • You approved
                              </Typography>
                            )}
                            {((tx.status === 'pending' || tx.status === 'confirmed' || tx.status === 'declined') && 
                              !isSentByUser(tx) && hasUserDeclined(tx)) && (
                              <Typography
                                variant="small"
                                className="text-[#9F9F9F] ml-2"
                              >
                                • You declined
                              </Typography>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(tx);
                            }}
                          >
                            <Eye size={14} />
                          </Button>
                          {pendingApproval && (
                            <div className="flex gap-2">
                              <Button
                                className={`bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded shadow transition cursor-pointer ${isApproving === getTxId(tx) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                onClick={() => handleApprove(tx)}
                                disabled={isApproving === getTxId(tx)}
                              >
                                {isApproving === getTxId(tx) ? (
                                  <span className="flex items-center gap-2">
                                    <svg
                                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                                      />
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8z"
                                      />
                                    </svg>
                                    Approving...
                                  </span>
                                ) : (
                                  'Approve'
                                )}
                              </Button>
                              <Button
                                className={`bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded shadow transition cursor-pointer ${isDeclining === getTxId(tx) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                onClick={() => handleDecline(tx)}
                                disabled={isDeclining === getTxId(tx)}
                              >
                                {isDeclining === getTxId(tx) ? (
                                  <span className="flex items-center gap-2">
                                    <svg
                                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                                      />
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8z"
                                      />
                                    </svg>
                                    Declining...
                                  </span>
                                ) : (
                                  'Decline'
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 mt-2">
                        <div>
                          <Typography variant="small" className="text-[#9F9F9F]">
                            Amount
                          </Typography>
                          <div className="flex items-center gap-1">
                            <Bitcoin size={16} color="#F97415" />
                            <Typography variant="base" className="font-semibold">
                              {(() => {
                                if (isSentByUser(tx)) {
                                  // If sender, show total amount
                                  return tx.to && Array.isArray(tx.to)
                                    ? (tx.to.reduce((sum: number, toEntry) => sum + Number(toEntry.amount), 0) / 1e8).toFixed(8)
                                    : '0.00000000';
                                } else {
                                  // If receiver, show their specific amount
                                  const recipientEntry = tx.to.find((entry) => 
                                    String(entry.principal) === String(principal)
                                  );
                                  return recipientEntry 
                                    ? (Number(recipientEntry.amount) / 1e8).toFixed(8)
                                    : '0.00000000';
                                }
                              })()} BTC
                            </Typography>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Typography variant="small" className="text-[#9F9F9F]">
                            {isSentByUser(tx) ? "To" : "Your Share"}
                          </Typography>
                          <Typography variant="base" className="font-semibold">
                            {isSentByUser(tx) ? (
                              `${tx.to.length} recipient${tx.to.length !== 1 ? "s" : ""}`
                            ) : (
                              (() => {
                                const recipientEntry = tx.to.find((entry) => 
                                  String(entry.principal) === String(principal)
                                );
                                return recipientEntry && recipientEntry.percentage 
                                  ? `${recipientEntry.percentage}%`
                                  : 'N/A';
                              })()
                            )}
                          </Typography>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Typography variant="small" className="text-[#9F9F9F]">
                            Bitcoin Address
                          </Typography>
                          <Typography
                            variant="base"
                            className="font-semibold text-[#FEB64D] truncate"
                            title={Array.isArray(tx.bitcoinAddress) && tx.bitcoinAddress.length > 0 ? tx.bitcoinAddress[0] : 'No address available'}
                          >
                            {Array.isArray(tx.bitcoinAddress) && tx.bitcoinAddress.length > 0 ? truncateHash(tx.bitcoinAddress[0] || '') : (tx.status === 'cancelled' ? 'Cancelled' : 'Pending')}
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
    </>
  );
}
