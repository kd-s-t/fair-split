import { motion } from 'framer-motion';
import { TransactionDetailsModalProps, ToEntry } from './types';

export default function TransactionDetailsModal({ transaction, onClose }: TransactionDetailsModalProps) {
  if (!transaction) return null;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl w-full max-w-md relative"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <button
          className="absolute top-2 right-2 text-lg font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>
        <div className="mb-2">
          <span className="font-semibold">From:</span>
          <span className="ml-2 font-mono text-xs">{String(transaction.from)}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Recipients:</span>
          <ul className="ml-4 mt-1">
            {transaction.to.map((toEntry: ToEntry, idx: number) => (
              <li key={idx} className="mb-1">
                <span className="font-mono text-xs">{String(toEntry.principal)}</span>
                {toEntry.name && <span className="ml-2 text-sm text-gray-500">({toEntry.name})</span>}
                <span className="ml-2 text-yellow-600 font-semibold">{Number(toEntry.amount) / 1e8} BTC</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Released At:</span>
          <span className="ml-2 text-xs">
            {transaction.releasedAt
              ? new Date(Number(transaction.releasedAt) * 1000).toLocaleString()
              : 'N/A'}
          </span>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Date:</span>
          <span className="ml-2 text-xs">{new Date(Number(transaction.timestamp) * 1000).toLocaleString()}</span>
        </div>
      </motion.div>
    </motion.div>
  );
} 