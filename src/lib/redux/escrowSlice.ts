import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipient } from '@/modules/escrow/types';

interface EscrowState {
  title: string;
  btcAmount: string;
  recipients: Recipient[];
  isLoading: boolean;
  showDialog: boolean;
  newTxId: string | null;
  editTxId: string | null;
}

const initialState: EscrowState = {
  title: '',
  btcAmount: '',
  recipients: [{ id: 'recipient-1', principal: '', percentage: 100 }],
  isLoading: false,
  showDialog: false,
  newTxId: null,
  editTxId: null,
};

const escrowSlice = createSlice({
  name: 'escrow',
  initialState,
  reducers: {
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
    setBtcAmount(state, action: PayloadAction<string>) {
      state.btcAmount = action.payload;
    },
    setRecipients(state, action: PayloadAction<Recipient[]>) {
      state.recipients = action.payload;
    },
    addRecipient(state, action: PayloadAction<Recipient>) {
      state.recipients.push(action.payload);
    },
    removeRecipient(state, action: PayloadAction<number>) {
      if (state.recipients.length > 1) {
        state.recipients.splice(action.payload, 1);
      }
    },
    updateRecipient(state, action: PayloadAction<{ index: number; field: keyof Recipient; value: string | number }>) {
      const { index, field, value } = action.payload;
      if (state.recipients[index]) {
        state.recipients[index] = { ...state.recipients[index], [field]: value };
      }
    },
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setShowDialog(state, action: PayloadAction<boolean>) {
      state.showDialog = action.payload;
    },
    setNewTxId(state, action: PayloadAction<string | null>) {
      state.newTxId = action.payload;
    },
    setEditTxId(state, action: PayloadAction<string | null>) {
      state.editTxId = action.payload;
    },
    resetEscrowForm(state) {
      state.title = '';
      state.btcAmount = '';
      state.recipients = [{ id: 'recipient-1', principal: '', percentage: 100 }];
      state.isLoading = false;
      state.showDialog = false;
      state.newTxId = null;
      state.editTxId = null;
    },
  },
});

export const {
  setTitle,
  setBtcAmount,
  setRecipients,
  addRecipient,
  removeRecipient,
  updateRecipient,
  setIsLoading,
  setShowDialog,
  setNewTxId,
  setEditTxId,
  resetEscrowForm,
} = escrowSlice.actions;

export default escrowSlice.reducer; 