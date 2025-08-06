export interface Step {
  label: string;
  description: string;
}

export interface TransactionLifecycleProps {
  currentStep: number; // 0-based index
  steps?: Step[];
}

export interface TransactionDetailsModalProps {
  transaction: EscrowTransaction | null;
  onClose: () => void;
}

// Core transaction types
export type ToEntry = {
  percentage: number;
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
  status: "pending" | "confirmed" | "released" | "cancelled" | "refund" | "declined";
  createdAt: string;
  title: string;
  depositAddress?: string;
  isRead?: boolean;
  releasedAt?: string;
  bitcoinAddress?: string;
  bitcoinTransactionHash?: string;
};

// Normalized transaction interface for Redux storage
export interface NormalizedTransaction {
  id: string;
  status: string;
  title: string;
  from: string;
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  releasedAt?: string;
  readAt?: string;
  bitcoinTransactionHash?: string;
  bitcoinAddress?: string;
  to: Array<{
    principal: string;
    amount: string;
    percentage: string;
    status: unknown;
    name: string;
    approvedAt?: string;
    declinedAt?: string;
    readAt?: string;
  }>;
}

// API response types for better type safety
export interface ApiToEntry {
  principal: unknown;
  amount: unknown;
  percentage: unknown;
  status: unknown;
  name: string;
  approvedAt?: unknown;
  declinedAt?: unknown;
  readAt?: unknown;
}

export interface ApiTransaction {
  id: string;
  from: unknown;
  to: ApiToEntry[];
  status: string;
  title: string;
  createdAt: unknown;
  confirmedAt?: unknown;
  cancelledAt?: unknown;
  refundedAt?: unknown;
  releasedAt?: unknown;
  readAt?: unknown;
  bitcoinTransactionHash?: unknown;
  bitcoinAddress?: unknown;
}

// Activity types for dashboard
export interface ActivityItem {
  id?: string;
  from: unknown;
  to?: Array<{
    principal: unknown;
    amount?: unknown;
    percentage?: unknown;
    status?: unknown;
    name?: string;
  }>;
  status?: string;
  title?: string;
  createdAt?: unknown;
}

// Component prop types
export interface PendingEscrowDetailsProps {
  transaction: EscrowTransaction;
  onCancel?: () => void;
}

export interface EditEscrowDetailsProps {
  transaction: EscrowTransaction;
  onCancel?: () => void;
  onEdit?: () => void;
}

export interface CancelledEscrowDetailsProps {
  transaction: EscrowTransaction;
}

export interface RefundedEscrowDetailsProps {
  transaction: EscrowTransaction;
}

export interface ConfirmedEscrowActionsProps {
  transaction: EscrowTransaction | NormalizedTransaction;
  isLoading: "release" | "refund" | null;
  onRelease: (id: unknown) => void;
  onRefund: () => void;
}

export interface ReleasedEscrowDetailsProps {
  transaction: EscrowTransaction | NormalizedTransaction;
} 