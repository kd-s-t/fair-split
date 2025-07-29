export interface Recipient {
  id: string
  principal: string
  percentage: number
}

export interface TransactionSummaryProps {
  btcAmount: string;
  recipients: Recipient[];
  isLoading: boolean;
  handleInitiateEscrow: () => void;
  showDialog: boolean;
  setShowDialog: (open: boolean) => void;
  newTxId: string | null;
}

export interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  onDone: () => void;
  depositAddress?: string;
}

export interface TransactionFormProps {
  title: string;
  setTitle: (title: string) => void;
  btcAmount: string;
  setBtcAmount: (btcAmount: string) => void;
  recipients: Recipient[];
  setRecipients: (recipients: Recipient[]) => void;
  handleAddRecipient: () => void;
  handleRemoveRecipient: (idx: number) => void;
  handleRecipientChange: (
    idx: number,
    field: keyof Recipient,
    value: string | number
  ) => void;
}
