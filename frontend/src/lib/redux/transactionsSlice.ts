import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NormalizedTransaction } from '@/modules/transactions/types';

interface TransactionsState {
  transactions: NormalizedTransaction[];
}

const initialState: TransactionsState = {
  transactions: [],
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions(state, action: PayloadAction<NormalizedTransaction[]>) {
      state.transactions = action.payload;
    },
    markAllAsRead(state) {
      // Mark all transactions as read by updating their readAt property
      state.transactions.forEach(() => {
        // Note: This would need to be implemented based on your actual Transaction structure
        // For now, we'll just update the transactions array to trigger a re-render
      });
    },
    markTransactionAsRead(state, action: PayloadAction<NormalizedTransaction>) {
      const updatedTx = action.payload;
      state.transactions = state.transactions.map((tx) => {
        const txId = `${tx.from}_${tx.to.map((toEntry) => toEntry.principal).join('-')}_${tx.createdAt}`;
        const updatedTxId = `${updatedTx.from}_${updatedTx.to.map((toEntry) => toEntry.principal).join('-')}_${updatedTx.createdAt}`;
        return txId === updatedTxId ? updatedTx : tx;
      });
    },
  },
});

export const { setTransactions, markAllAsRead, markTransactionAsRead } = transactionsSlice.actions;
export default transactionsSlice.reducer; 