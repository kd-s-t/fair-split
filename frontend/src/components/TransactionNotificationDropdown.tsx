import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { createSplitDappActor } from '@/lib/icp/splitDapp';
import { Principal } from '@dfinity/principal';

interface Transaction {
  to: Principal[];
  from: Principal;
  timestamp: bigint;
  amount: bigint;
}

function getTxId(tx: Transaction) {
  return `${tx.from.toText()}_${tx.to.map(toEntry => toEntry.principal.toText()).join('-')}_${tx.timestamp.toString()}`;
}

export default function TransactionNotificationDropdown({ principalId }: { principalId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // Load read IDs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('readTxIds');
    if (stored) setReadIds(JSON.parse(stored));
  }, []);

  // Fetch transactions
  useEffect(() => {
    if (!principalId) return;
    (async () => {
      const actor = await createSplitDappActor();
      const txs = await actor.getTransactions(Principal.fromText(principalId));
      setTransactions(txs as Transaction[]);
    })();
  }, [principalId]);

  // Mark all as read when dropdown opens
  useEffect(() => {
    if (open && transactions.length > 0) {
      const ids = transactions.map(getTxId);
      setReadIds(ids);
      localStorage.setItem('readTxIds', JSON.stringify(ids));
    }
  }, [open, transactions]);

  const unreadCount = transactions.filter(tx => !readIds.includes(getTxId(tx))).length;

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
                  <span className="text-xs font-mono truncate">From: {tx.from.toText()}</span>
                  <span className="text-xs font-mono truncate">To: {tx.to.map(toEntry => toEntry.principal.toText()).join(', ')}</span>
                  <span className="text-xs font-semibold text-yellow-600">{Number(tx.amount) / 1e8} BTC</span>
                  <span className="text-xs text-muted-foreground">{new Date(Number(tx.timestamp) / 1_000_000).toLocaleString()}</span>
                </div>
              </DropdownMenuItem>
            ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 