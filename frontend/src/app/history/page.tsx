"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import type { Transaction } from "@/declarations/split_dapp/split_dapp.did";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../lib/redux/store';
import { setTransactions, markAllAsRead } from '../../lib/redux/transactionsSlice';
import TransactionDetailsModal from "../../components/TransactionDetailsModal";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const { principal } = useAuth();
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!principal) return;
      setIsLoading(true);
      setError(null);
      try {
        const actor = await createSplitDappActor();
        const txs = await actor.getTransactions(principal);
        const serializableTxs = txs.map(tx => ({
          ...tx,
          from: typeof tx.from === 'string' ? tx.from : tx.from.toText(),
          timestamp: typeof tx.timestamp === 'bigint' ? tx.timestamp.toString() : tx.timestamp,
          to: tx.to.map(toEntry => ({
            ...toEntry,
            principal: toEntry.principal && typeof toEntry.principal === 'object' && typeof toEntry.principal.toText === 'function'
              ? toEntry.principal.toText()
              : (typeof toEntry.principal === 'string'
                  ? toEntry.principal
                  : String(toEntry.principal)),
            amount: typeof toEntry.amount === 'bigint' ? toEntry.amount.toString() : toEntry.amount,
          })),
        }));
        dispatch(setTransactions(serializableTxs));
      } catch (err: any) {
        setError(err.message || "Failed to fetch transactions");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [principal, dispatch]);

  function getTxId(tx: Transaction) {
    return `${tx.from}_${tx.to.map(toEntry => toEntry.principal).join('-')}_${tx.timestamp}`;
  }

  async function handleRowClick(tx: Transaction) {
    if (!principal) return;
    if (!tx.isRead) {
      const actor = await createSplitDappActor();
      await actor.markTransactionsAsRead(principal);
      dispatch(markAllAsRead());
    }
    // Navigate to the transaction details page
    router.push(`/history/${encodeURIComponent(getTxId(tx))}`);
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">Transaction History</h1>
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
      {!isLoading && !error && transactions.length === 0 && (
        <div className="text-center text-muted-foreground">No transactions found.</div>
      )}
      {!isLoading && !error && transactions.length > 0 && (
        <Table className="rounded-xl overflow-hidden border border-slate-200 shadow-md bg-white">
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead className="p-3 text-left">From</TableHead>
              <TableHead className="p-3 text-left">To</TableHead>
              <TableHead className="p-3 text-right">Amount</TableHead>
              <TableHead className="p-3 text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions
              .slice()
              .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
              .map((tx, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`hover:bg-yellow-50 transition-colors ${!tx.isRead ? 'bg-yellow-100' : ''} cursor-pointer`}
                  onClick={() => handleRowClick(tx)}
                >
                  <TableCell className="p-3 font-mono text-xs">{tx.from}</TableCell>
                  <TableCell className="p-3 font-mono text-xs">
                    {tx.to.map(toEntry => toEntry.principal).join(', ')}
                  </TableCell>
                  <TableCell className="p-3 text-right font-semibold text-yellow-600">
                    {tx.to.reduce((sum, toEntry) => sum + Number(toEntry.amount), 0) / 1e8}
                  </TableCell>
                  <TableCell className="p-3 text-right text-xs">
                    {new Date(Number(tx.timestamp) / 1_000_000).toLocaleString()}
                  </TableCell>
                </motion.tr>
              ))}
          </TableBody>
        </Table>
      )}
    </motion.div>
  );
} 