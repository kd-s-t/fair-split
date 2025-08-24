"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import type { NormalizedTransaction } from "@/modules/transactions/types";
import { motion } from "framer-motion";
import { Search, RotateCw } from "lucide-react";

// Helper function to convert API response to NormalizedTransaction[]
const convertToNormalizedTransactions = (transactions: unknown[]): NormalizedTransaction[] => {
  const normalizedTxs = transactions.map((tx: unknown) => {
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

  // Deduplicate transactions by ID, keeping the latest one
  const uniqueTxs = new Map<string, NormalizedTransaction>();
  normalizedTxs.forEach(tx => {
    const existing = uniqueTxs.get(tx.id);
    if (!existing || Number(tx.createdAt) > Number(existing.createdAt)) {
      uniqueTxs.set(tx.id, tx);
    }
  });

  return Array.from(uniqueTxs.values());
};

import {
  markAllAsRead,
  setTransactions,
} from "../../lib/redux/transactionsSlice";
import { useRouter } from "next/navigation";


import {
  ArrowDownLeft,
  ArrowUpRight,
  Bitcoin,
  Wallet,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { setTitle, setSubtitle } from '../../lib/redux/store';
import { useDispatch } from "react-redux";
import { ApprovalSuggestions } from "@/components/messaging/ApprovalSuggestions";

// Helper function to get AI suggestion for a transaction
function getTransactionSuggestion(tx: NormalizedTransaction): string | null {
  if (tx.status !== 'pending') return null;

  const percentages = tx.to.map(r => Number(r.percentage));
  const isEquallySplit = percentages.every(p => p === percentages[0]);

  if (isEquallySplit) {
    return "AI suggests: Approve - Equal split detected";
  } else {
    return "AI suggests: Review - Uneven split detected";
  }
}

import { useTransactions } from "@/hooks/useTransactions";
import TransactionStatusBadge from "@/components/TransactionStatusBadge";

export default function TransactionsPage() {
  const { principal } = useAuth();
  const dispatch = useDispatch();
  const { transactions } = useTransactions();

  useEffect(() => {
    dispatch(setTitle('Transaction history'));
    dispatch(setSubtitle('View all your escrow transactions'));
  }, [dispatch]);

  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [localTransactions, setLocalTransactions] = useState<NormalizedTransaction[]>([]);
  const router = useRouter();



  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const refreshIconRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const sorted = [...transactions].sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
      setLocalTransactions(sorted);
    }
  }, [transactions]);

  // Listen for AI suggestion triggers
  useEffect(() => {
    const shouldShow = sessionStorage.getItem('splitsafe_show_approval_suggestions');
    if (shouldShow) {
      sessionStorage.removeItem('splitsafe_show_approval_suggestions');
      setShowSuggestions(true);
    }

    const handleRefresh = () => {
      setShowSuggestions(true);
    };

    window.addEventListener('refresh-approval-suggestions', handleRefresh);
    return () => {
      window.removeEventListener('refresh-approval-suggestions', handleRefresh);
    };
  }, []);

  const availableCategories = Array.from(new Set(localTransactions.map(tx => getTransactionCategory(tx))));
  const availableStatuses = Array.from(new Set(localTransactions.map(tx => tx.status)));

  function truncateHash(hash: string): string {
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  }

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
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
      toast.error('Failed to refresh transactions');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6" >
      {/* AI Approval Suggestions */}
      <ApprovalSuggestions transactions={localTransactions} />

      {/* Filter Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#BCBCBC]" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#222222] border border-[#303434] rounded-lg text-white placeholder-[#BCBCBC] focus:outline-none focus:border-[#FEB64D]"
            />
          </div>

          {/* Category Filter */}
          <select className="px-4 py-2.5 bg-[#222222] border border-[#303434] rounded-lg text-white focus:outline-none focus:border-[#FEB64D] min-w-[156px]">
            <option value="all">All categories</option>
            {availableCategories.includes('sent') && <option value="sent">Sent</option>}
            {availableCategories.includes('received') && <option value="received">Received</option>}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-[#222222] border border-[#303434] rounded-lg text-white focus:outline-none focus:border-[#FEB64D] min-w-[139px]"
          >
            <option value="all">All status</option>
            {availableStatuses.includes('pending') && <option value="pending">Pending</option>}
            {availableStatuses.includes('confirmed') && <option value="confirmed">Active</option>}
            {availableStatuses.includes('released') && <option value="released">Released</option>}
            {availableStatuses.includes('cancelled') && <option value="cancelled">Cancelled</option>}
            {availableStatuses.includes('declined') && <option value="declined">Declined</option>}
          </select>

          {/* Refresh Button */}
          <button
            ref={refreshIconRef}
            onClick={fetchTransactions}
            className="px-3 py-2.5 border border-[#7A7A7A] rounded-lg text-white hover:bg-[#2a2a2a] transition-colors flex items-center space-x-2"
            disabled={refreshing}
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Transaction Count */}
        <p className="text-[#BCBCBC] text-sm">
          Showing {currentTransactions.length} of {localTransactions.length} transactions
        </p>
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        {!isLoading && !error && (
          <>
            {localTransactions.length === 0 && (
              <div className="text-center text-[#BCBCBC] py-8">No transactions found.</div>
            )}

            {currentTransactions.map((tx, idx: number) => {
              const pendingApproval = isPendingApproval(tx);
              const isRowClickable = (!pendingApproval && getTransactionCategory(tx) === "sent") &&
                (tx.status !== "withdraw_complete" && tx.status !== "withdraw_pending");

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`bg-[#222222] rounded-[20px] p-4 md:p-5 border-0 w-full ${!pendingApproval || getTransactionCategory(tx) === "sent" ? 'hover:bg-[#2a2a2a] transition-colors cursor-pointer' : ''}`}
                  onClick={isRowClickable ? () => handleRowClick(tx) : undefined}
                >
                  <div className="flex items-start justify-between mb-4 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-white truncate">{tx.title}</h3>
                        <TransactionStatusBadge status={tx.status} />
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-[#BCBCBC]">
                        <span>{new Date(Number(tx.createdAt) / 1_000_000).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}</span>
                        {getTransactionCategory(tx) === "sent" ? (
                          <div className="flex items-center space-x-1 text-[#007AFF]">
                            <ArrowUpRight size={14} />
                            <span>Sent</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-[#00C287]">
                            <ArrowDownLeft size={14} />
                            <span>Receiving</span>
                          </div>
                        )}
                        {((tx.status === 'pending' || tx.status === 'confirmed') &&
                          !isSentByUser(tx) && hasUserApproved(tx)) && (
                            <span>• You approved</span>
                          )}
                        {((tx.status === 'pending' || tx.status === 'confirmed' || tx.status === 'declined') &&
                          !isSentByUser(tx) && hasUserDeclined(tx)) && (
                            <span>• You declined</span>
                          )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 ml-4">
                      {getTransactionCategory(tx) === "sent" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#7A7A7A] text-white whitespace-nowrap hover:bg-[#2A2A2A] transition-colors"
                          onClick={() => router.push(`/transactions/${tx.id}`)}
                        >
                          <Wallet className="w-4 h-4 mr-2" />
                          Manage escrow
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#7A7A7A] text-white whitespace-nowrap hover:bg-[#2A2A2A] transition-colors"
                          onClick={() => router.push(`/transactions/${tx.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View escrow
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Transaction Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 rounded-[10px]">
                    <div>
                      <p className="text-[#BCBCBC] text-sm mb-1">Amount</p>
                      <div className="flex items-center space-x-2">
                        <Bitcoin size={20} className="text-[#F97415]" />
                        <span className="font-semibold text-white">
                          {(() => {
                            if (isSentByUser(tx)) {
                              return tx.to && Array.isArray(tx.to)
                                ? (tx.to.reduce((sum: number, toEntry) => sum + Number(toEntry.amount), 0) / 1e8).toFixed(8)
                                : '0.00000000';
                            } else {
                              const recipientEntry = tx.to.find((entry) =>
                                String(entry.principal) === String(principal)
                              );
                              return recipientEntry
                                ? (Number(recipientEntry.amount) / 1e8).toFixed(8)
                                : '0.00000000';
                            }
                          })()} BTC
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[#BCBCBC] text-sm mb-1">
                        {isSentByUser(tx) ? "To" : "Your Share"}
                      </p>
                      <p className="font-semibold text-white">
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
                      </p>
                    </div>

                    <div>
                      <p className="text-[#BCBCBC] text-sm mb-1">Transaction hash</p>
                      <a
                        href={`https://blockstream.info/block/00000000000000000001bb418ff8dfff65ea0dab3d9f53923112d2b2f12f4ee7`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#FEB64D] font-mono text-sm hover:underline"
                      >
                        {truncateHash('00000000000000000001bb418ff8dfff65ea0dab3d9f53923112d2b2f12f4ee7')}
                      </a>
                    </div>
                  </div>

                  {/* AI Suggestion */}
                  {showSuggestions && getTransactionSuggestion(tx) && (
                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-sm text-blue-300">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        {getTransactionSuggestion(tx)}
                      </div>
                    </div>
                  )}


                </motion.div>
              );
            })}
          </>
        )}
        {error && <div className="text-red-500 text-center">{error}</div>}
      </div>
    </div>
  );
}
