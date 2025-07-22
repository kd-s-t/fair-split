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
    markTransactionAsRead(state, action: PayloadAction<string>) {
      // action.payload is the transaction id (use getTxId logic)
      state.transactions.forEach(tx => {
        const txId = `${tx.from.toText()}_${tx.to.map(toEntry => toEntry.principal.toText()).join('-')}_${tx.timestamp.toString()}`;
        if (txId === action.payload) {
          tx.isRead = true;
        }
      });
    },
  },
});

export const { setTransactions, markAllAsRead, markTransactionAsRead } = transactionsSlice.actions;
export default transactionsSlice.reducer; 