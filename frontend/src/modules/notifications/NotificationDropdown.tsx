import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { createSplitDappActor } from '@/lib/icp/splitDapp';
import { Principal } from '@dfinity/principal';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/lib/redux/store';
import { setTransactions, markTransactionAsRead } from '@/lib/redux/transactionsSlice';
import TransactionDetailsModal from '@/modules/transactions/DetailsModal';
import { useAppSelector } from '@/lib/redux/store';
import type { Transaction } from '@/declarations/split_dapp.did';
import { motion, AnimatePresence } from 'framer-motion';

function getTxId(tx: Transaction) {
  // If tx.to is an array of Principal, join their text representations
  return `${tx.from}_${tx.to.map((toEntry: any) => toEntry.principal).join('-')}_${tx.timestamp}`;
}

export default function TransactionNotificationDropdown({ principalId }: { principalId: string }) {
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const dispatch = useDispatch();
  const [readIds, setReadIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const principal = useAppSelector(state => state.user.principal);

  // Load read IDs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('readTxIds');
    if (stored) setReadIds(JSON.parse(stored));
  }, []);
  // Fetch transactions and update Redux
  // Transactions are now fetched centrally in layout.tsx
  // No need to fetch them here anymore

  // Mark all as read when dropdown opens
  useEffect(() => {
    if (open && transactions.length > 0) {
      const ids = transactions.map(getTxId);
      setReadIds(ids);
      localStorage.setItem('readTxIds', JSON.stringify(ids));
    }
  }, [open, transactions]);

  const unreadCount = transactions.filter(tx => !tx.isRead).length;
  const [bellRing, setBellRing] = useState(false);

  // Ring bell every 5 seconds when there are unread notifications
  useEffect(() => {
    if (unreadCount === 0) return;
    
    const interval = setInterval(() => {
      setBellRing(true);
      setTimeout(() => setBellRing(false), 300);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [unreadCount]);

  const handleRowClick = async (tx: any) => {
    const txId = getTxId(tx);
    if (!readIds.includes(txId)) {
      setReadIds(prev => {
        const updated = [...prev, txId];
        localStorage.setItem('readTxIds', JSON.stringify(updated));
        return updated;
      });
      dispatch(markTransactionAsRead(txId));
    }
    setSelectedTx(tx);
    setModalOpen(true);
  };

  return (
    <>
      <DropdownMenu onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <motion.button 
            type="button" 
            className="relative text-muted-foreground hover:text-foreground transition cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={bellRing ? { 
              rotate: [0, -15, 15, -15, 15, 0],
              scale: [1, 1.2, 1]
            } : unreadCount > 0 ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ 
              duration: bellRing ? 0.3 : 0.6,
              repeat: bellRing ? 0 : (unreadCount > 0 ? Infinity : 0),
              repeatDelay: 2
            }}
          >
            <Bell className="w-5 h-5" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 500 }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" side="left" align="start">
          <motion.div 
            className="px-3 py-2 font-semibold border-b border-slate-700"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Transactions
          </motion.div>
          {transactions.length === 0 ? (
            <motion.div 
              className="px-3 py-4 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              No transactions
            </motion.div>
          ) : (
            <AnimatePresence>
              {transactions
                .slice()
                .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                .map((tx, idx) => (
                  <motion.div
                    key={getTxId(tx)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <DropdownMenuItem
                      className={!readIds.includes(getTxId(tx)) ? 'bg-yellow-100 text-black' : ''}
                      onClick={() => handleRowClick(tx)}
                    >
                      <div className="flex flex-col w-full">
                        <span className="text-xs font-mono truncate">From: {tx.from}</span>
                        <span className="text-xs font-mono truncate">To: {tx.to.map((toEntry: any) => (toEntry.principal ? toEntry.principal : toEntry.toText())).join(', ')}</span>
                        <span className="text-xs font-semibold text-yellow-600">
                          {tx.to.reduce((sum: any, toEntry: any) => sum + Number(toEntry.amount), 0) / 1e8} BTC
                        </span>
                        <span className="text-xs text-muted-foreground">{new Date(Number(tx.timestamp) / 1_000_000).toLocaleString()}</span>
                      </div>
                    </DropdownMenuItem>
                  </motion.div>
                ))}
            </AnimatePresence>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <TransactionDetailsModal
        transaction={selectedTx}
        onClose={() => {
          setModalOpen(false);
          setSelectedTx(null);
        }}
      />
    </>
  );
} 