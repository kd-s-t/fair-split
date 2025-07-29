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