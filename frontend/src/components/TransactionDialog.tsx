import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  onDone: () => void;
  depositAddress?: string;
}

export default function TransactionDialog({
  open,
  onOpenChange,
  amount,
  onDone,
}: TransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col items-center text-center">
        <img src="/check.png" alt="check" className="w-15 h-15" />
        <h2 className="text-2xl font-bold mb-2 mt-8">Escrow initiated</h2>
        <p className="text-gray-400 mb-6 max-w-md">
          The Bitcoin escrow has been successfully created and is awaiting funding.
        </p>
        <div className="w-full bg-[#222222] border border-[#303434] rounded-[10px] p-3 mb-6">
          <Typography variant="muted">
            Send {amount} BTC to the generated deposit to activate the escrow.
          </Typography>
        </div>
        <Button
          className="w-full"
          onClick={onDone}
        >
          Done
        </Button>
      </div>
    </Dialog>
  );
} 