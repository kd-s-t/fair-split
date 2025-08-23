import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TRANSACTION_STATUS_MAP } from '@/lib/constants';

interface TransactionStatusBadgeProps {
  status: string;
  className?: string;
}

const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({
  status,
  className
}) => {
  const variant = (TRANSACTION_STATUS_MAP[status]?.variant ?? "default") as
    | "secondary"
    | "success"
    | "primary"
    | "error"
    | "default"
    | "outline"
    | "warning";

  return (
    <Badge variant={variant} className={className}>
      {TRANSACTION_STATUS_MAP[status]?.label || status}
    </Badge>
  );
};

export default TransactionStatusBadge
