"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "../../../lib/redux/store";
import { useMemo, useState } from "react";
import { createSplitDappActor } from '@/lib/icp/splitDapp';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export default function TransactionDetailsPage() {
  const [isLoading, setIsLoading] = useState<'release' | 'refund' | null>(null);
  const { txid } = useParams();
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const transaction = useMemo(() => {
    return transactions.find(tx => {
      const id = `${tx.from}_${tx.to.map(toEntry => toEntry.principal).join('-')}_${tx.timestamp}`;
      return id === txid;
    });
  }, [transactions, txid]);
  console.log(transaction);
  console.log('Transaction status:', transaction && transaction.status ? Object.keys(transaction.status)[0] : 'unknown');
  if (!transaction) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex flex-col gap-4">
          <div className="h-10 bg-gray-200 animate-pulse rounded w-1/2 mx-auto" />
          <div className="h-32 bg-gray-200 animate-pulse rounded" />
          <div className="h-20 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  const handleRelease = async () => {
    setIsLoading('release');
    try {
      const actor = await createSplitDappActor();
      await actor.releaseSplit(Principal.fromText(
        typeof transaction.from === 'string'
          ? transaction.from
          : transaction.from.toText()
      ));
      toast.success('Escrow released!');
    } catch (err) {
      console.error('Release error:', err);
      toast.error('Failed to release escrow' + (err && (err as any).message ? ': ' + (err as any).message : ''));
    } finally {
      setIsLoading(null);
    }
  };

  const handleRefund = async () => {
    setIsLoading('refund');
    try {
      const actor = await createSplitDappActor();
      await actor.cancelSplit(Principal.fromText(
        typeof transaction.from === 'string'
          ? transaction.from
          : transaction.from.toText()
      ));
      toast.success('Escrow refunded!');
    } catch (err) {
      console.error('Refund error:', err);
      toast.error('Failed to refund escrow' + (err && (err as any).message ? ': ' + (err as any).message : ''));
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold mb-4">Manage escrow – Active</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Escrow overview */}
        <div className="flex-1 bg-slate-900 rounded-xl p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Escrow overview</h2>
          <div className="flex justify-between mb-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl">₿</span>
              <span className="text-xs text-slate-300">Total BTC</span>
              <span className="font-mono">{transaction.to.reduce((sum, toEntry) => sum + Number(toEntry.amount), 0) / 1e8}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl">👥</span>
              <span className="text-xs text-slate-300">Recipients</span>
              <span>{transaction.to.length}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl">⚡</span>
              <span className="text-xs text-slate-300">Status</span>
              <span className="text-green-400">{transaction.status ? Object.keys(transaction.status)[0] : 'unknown'}</span>
            </div>
          </div>
          {/* Add refund/release buttons if status is pending */}
          {transaction.status && Object.keys(transaction.status)[0] === 'pending' && (
            <div className="flex gap-4 mb-2">
              <button
                className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold cursor-pointer"
                onClick={handleRelease}
                disabled={isLoading === 'release' || isLoading === 'refund'}
              >
                {isLoading === 'release' ? 'Releasing...' : 'Release payment'}
              </button>
              <button
                className="bg-slate-700 px-4 py-2 rounded text-white cursor-pointer"
                onClick={handleRefund}
                disabled={isLoading === 'release' || isLoading === 'refund'}
              >
                {isLoading === 'refund' ? 'Refunding...' : 'Request refund'}
              </button>
            </div>
          )}
          <div className="mb-4">
            <div className="text-xs text-slate-400 mb-1">Transaction from</div>
            <div className="bg-slate-800 rounded px-2 py-1 font-mono text-xs flex items-center justify-between">
              <span>{typeof transaction.from === 'string' ? transaction.from : (transaction.from.toText ? transaction.from.toText() : transaction.from.toString())}</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Recipients breakdown</h3>
            <div className="space-y-1">
              {transaction.to.map((toEntry, idx) => (
                <div key={idx} className="flex justify-between bg-slate-800 rounded px-2 py-1 text-xs font-mono">
                  <span>{typeof toEntry.principal === 'string' ? toEntry.principal : (toEntry.principal.toText ? toEntry.principal.toText() : toEntry.principal.toString())}</span>
                  <span>{(Number(toEntry.amount) / 1e8).toFixed(8)} BTC</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Transaction lifecycle */}
        <div className="w-full md:w-80 bg-slate-800 rounded-xl p-6 text-white flex flex-col gap-4">
          <div className="bg-yellow-900 text-yellow-300 rounded px-2 py-1 text-xs mb-2">Native Bitcoin Escrow — No bridges or wrapped tokens</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
              <span>Locked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
              <span>Trigger Met</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-600 inline-block"></span>
              <span>Splitting</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-600 inline-block"></span>
              <span>Released</span>
            </div>
          </div>
          <div className="bg-slate-900 text-xs rounded p-2 mt-2">This escrow is executed fully on-chain using Internet Computer. No human mediation.</div>
        </div>
      </div>
      {/* Escrow actions */}
      <div className="bg-slate-900 rounded-xl p-6 text-white flex flex-col gap-4">
        <div className="bg-yellow-900 text-yellow-300 rounded px-2 py-1 text-xs mb-2">Note: Release payment only when you're satisfied with the delivered work or received goods.</div>
        <div className="bg-slate-800 text-xs rounded p-2">Smart contract execution: Funds are locked and will be released by smart contract logic. No human mediation.</div>
      </div>
    </div>
  );
} 