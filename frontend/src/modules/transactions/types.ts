export interface Step {
  label: string;
  description: string;
}

export interface TransactionLifecycleProps {
  currentStep: number; // 0-based index
  steps?: Step[];
}

export interface TransactionDetailsModalProps {
  transaction: any | null;
  onClose: () => void;
}

// Core transaction types
export type ToEntry = {
  principal: string;
  name: string;
  amount: bigint;
  status: { [key: string]: null }; // e.g., { approved: null } or { pending: null }
  approvedAt?: string;
  declinedAt?: string;
  readAt?: string;
};

export type EscrowTransaction = {
  id: string;
  from: string;
  to: ToEntry[];
  status: "pending" | "confirmed" | "released" | "cancelled";
  createdAt: string;
  title: string;
  depositAddress?: string;
  isRead?: boolean;
  releasedAt?: string;
  bitcoinAddress?: string;
  bitcoinTransactionHash?: string;
};

// Component prop types
export interface PendingEscrowDetailsProps {
  transaction: EscrowTransaction;
  onCancel?: () => void;
}

export interface CancelledEscrowDetailsProps {
  transaction: EscrowTransaction;
}

export interface ConfirmedEscrowActionsProps {
  transaction: any;
  isLoading: "release" | "refund" | null;
  onRelease: (id: unknown) => void;
  onRefund: () => void;
}

export interface ReleasedEscrowDetailsProps {
  transaction: any;
}

// Extended type for serialized transaction data
export type SerializedTransaction = {
  id: string;
  from: any;
  to: Array<{
    principal: any;
    name: string;
    amount: bigint;
    status: { [key: string]: null };
    approvedAt?: string;
    declinedAt?: string;
    readAt?: string;
  }>;
  status: string;
  title: string;
  timestamp: string;
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  releasedAt?: string;
  readAt?: string;
  bitcoinAddress?: string;
  bitcoinTransactionHash?: string;
}; 