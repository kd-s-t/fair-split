import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { createSplitDappActor } from '@/lib/icp/splitDapp';
import { Principal } from '@dfinity/principal';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../lib/redux/store';
import { setTransactions } from '../lib/redux/transactionsSlice';

interface Transaction {
  to: any[]; // Use any to avoid linter error for now
  from: Principal;
  timestamp: bigint;
  amount: bigint;
}

function getTxId(tx: Transaction) {
  // If tx.to is an array of Principal, join their text representations
  return `${tx.from}_${tx.to.map((toEntry: any) => toEntry.principal).join('-')}_${tx.timestamp}`;
}

export default function TransactionNotificationDropdown({ principalId }: { principalId: string }) {
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const dispatch = useDispatch();
  const [readIds, setReadIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // Load read IDs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('readTxIds');
    if (stored) setReadIds(JSON.parse(stored));
  }, []);
  console.log("transactions", transactions)
  // Fetch transactions and update Redux
  useEffect(() => {
    if (!principalId) return;
    (async () => {
      const actor = await createSplitDappActor();
      const txs = await actor.getTransactions(Principal.fromText(principalId));
      const serializableTxs = txs.map(tx => ({
        ...tx,
        from: typeof tx.from === 'string' ? tx.from : tx.from.toText(),
        timestamp: typeof tx.timestamp === 'bigint' ? tx.timestamp.toString() : tx.timestamp,
        to: tx.to.map(toEntry => ({
          ...toEntry,
          principal: typeof toEntry.principal === 'string'
            ? toEntry.principal
            : (toEntry.principal && typeof toEntry.principal.toText === 'function'
                ? toEntry.principal.toText()
                : String(toEntry.principal)),
          amount: typeof toEntry.amount === 'bigint' ? toEntry.amount.toString() : toEntry.amount,
        })),
      }));
      console.log('serializableTxs', serializableTxs);
      dispatch(setTransactions(serializableTxs));
    })();
  }, [principalId, dispatch]);

  // Mark all as read when dropdown opens
  useEffect(() => {
    if (open && transactions.length > 0) {
      const ids = transactions.map(getTxId);
      setReadIds(ids);
      localStorage.setItem('readTxIds', JSON.stringify(ids));
    }
  }, [open, transactions]);

  const unreadCount = transactions.filter(tx => !tx.isRead).length;

  return (
    <DropdownMenu onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button type="button" className="relative text-muted-foreground hover:text-foreground transition cursor-pointer">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">{unreadCount}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
        <div className="px-3 py-2 font-semibold border-b border-slate-700">Transactions</div>
        {transactions.length === 0 ? (
          <div className="px-3 py-4 text-sm text-muted-foreground">No transactions</div>
        ) : (
          transactions
            .slice()
            .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
            .map((tx, idx) => (
              <DropdownMenuItem key={getTxId(tx)} className={!readIds.includes(getTxId(tx)) ? 'bg-yellow-100 text-black' : ''}>
                <div className="flex flex-col w-full">
                  <span className="text-xs font-mono truncate">From: {tx.from}</span>
                  <span className="text-xs font-mono truncate">To: {tx.to.map((toEntry: any) => (toEntry.principal ? toEntry.principal : toEntry.toText())).join(', ')}</span>
                  <span className="text-xs font-semibold text-yellow-600">{tx.to.reduce((sum, toEntry) => sum + Number(toEntry.amount), 0) / 1e8} BTC</span>
                  <span className="text-xs text-muted-foreground">{new Date(Number(tx.timestamp) / 1_000_000).toLocaleString()}</span>
                </div>
              </DropdownMenuItem>
            ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 