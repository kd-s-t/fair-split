"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import type { Transaction } from "@/declarations/split_dapp/split_dapp.did";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { motion } from 'framer-motion';
import TransactionDetailsModal from "../../components/TransactionDetailsModal";

export default function HistoryPage() {
  const { principal } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!principal) return;
      setIsLoading(true);
      setError(null);
      try {
        const actor = await createSplitDappActor();
        const txs = await actor.getTransactions(principal);
        console.log("txs", txs)
        setTransactions(txs as Transaction[]);
      } catch (err: any) {
        setError(err.message || "Failed to fetch transactions");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [principal]);

  function getTxId(tx: Transaction) {
    return `${tx.from.toText()}_${tx.to.map(toEntry => toEntry.principal.toText()).join('-')}_${tx.timestamp.toString()}`;
  }

  async function handleRowClick(tx: Transaction) {
    if (!principal) return;
    if (!tx.isRead) {
      const actor = await createSplitDappActor();
      await actor.markTransactionsAsRead(principal);
      setTransactions(prev => prev.map(t => ({ ...t, isRead: true })));
    }
    setSelectedTx(tx);
    setModalOpen(true);
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">Transaction History</h1>
      {isLoading && <div className="text-center">Loading...</div>}
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
                  onClick={() => handleRowClick(tx)} // for modal/details
                >
                  <TableCell className="p-3 font-mono text-xs">{tx.from.toText()}</TableCell>
                  <TableCell className="p-3 font-mono text-xs">
                    {tx.to.map(toEntry => toEntry.principal.toText()).join(', ')}
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
      {modalOpen && selectedTx && (
        <TransactionDetailsModal
          transaction={selectedTx}
          onClose={() => setModalOpen(false)}
        />
      )}
    </motion.div>
  );
} 