import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Transaction } from '@/declarations/split_dapp/split_dapp.did';

interface TransactionsState {
  transactions: Transaction[];
}

const initialState: TransactionsState = {
  transactions: [],
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.transactions = action.payload;
    },
    markAllAsRead(state) {
      state.transactions.forEach(tx => { tx.isRead = true; });
    },
    markTransactionAsRead(state, action: PayloadAction<Transaction>) {
      const updatedTx = action.payload;
      state.transactions = state.transactions.map(tx => {
        const txId = `${tx.from}_${tx.to.map(toEntry => toEntry.principal).join('-')}_${tx.timestamp}`;
        const updatedTxId = `${updatedTx.from}_${updatedTx.to.map(toEntry => toEntry.principal).join('-')}_${updatedTx.timestamp}`;
        return txId === updatedTxId ? updatedTx : tx;
      });
    },
  },
});

export const { setTransactions, markAllAsRead, markTransactionAsRead } = transactionsSlice.actions;
export default transactionsSlice.reducer; 