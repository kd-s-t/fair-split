import * as React from 'react';
import { Dialog } from './dialog';
import { Button } from '@/components/ui/button';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  onDone: () => void;
  depositAddress?: string;
}

export function TransactionDialog({
  open,
  onOpenChange,
  amount,
  onDone,
  depositAddress,
}: TransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-[#FEB64D] mb-6">
          <img src="/check.svg" alt="check" className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Escrow initiated</h2>
        <p className="text-gray-400 mb-6 max-w-xs">
          The Bitcoin escrow has been successfully created and is awaiting funding.
        </p>
        <div className="w-full bg-[#222222] border border-[#303434] rounded-[10px] p-3 mb-6">
          <span className="text-gray-200 text-sm">
            Send <span className="font-semibold">{amount} BTC</span> to the generated deposit{depositAddress ? ` (${depositAddress})` : ''} to activate the escrow.
          </span>
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