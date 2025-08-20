"use client"

import React from 'react';
import TransactionCard from './TransactionCard';
import { Typography } from '@/components/ui/typography';

export default function TransactionCardDemo() {
  const handleTransactionClick = () => {
    console.log('Transaction clicked');
  };

  const handleActionClick = () => {
    console.log('Action clicked');
  };

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h2" className="mb-4">Transaction Card Demo</Typography>
        <Typography variant="muted" className="mb-6">
          This demonstrates the TransactionCard component matching the exact design from the transaction history page.
        </Typography>
      </div>

      {/* Demo with exact data from the image */}
      <div className="space-y-4">
        <TransactionCard
          title="Software Development Team"
          status="pending"
          date="Jul 20, 03:32 PM"
          type="received"
          amountBtc="0.00900000 BTC"
          transactionHash="e3c1d7f0a8426a9b8f3c"
          yourShare="30%"
          isApproved={false}
          onClick={handleTransactionClick}
        />

        <TransactionCard
          title="Freelance project payment"
          status="active"
          date="Jul 15, 06:30 PM"
          type="sent"
          amountBtc="0.00500000 BTC"
          transactionHash="a1b2c3d4e5f678901234"
          recipients="2 recipients"
          isApproved={false}
          onClick={handleTransactionClick}
        />

        <TransactionCard
          title="NFT collab - July share"
          status="completed"
          date="Jul 12, 07:29 PM"
          type="received"
          amountBtc="0.00500000 BTC"
          transactionHash="e3c1d7f0a8426a9b8f3c"
          yourShare="80%"
          isApproved={false}
          onClick={handleTransactionClick}
        />

        <TransactionCard
          title="Smart Contract Audit"
          status="pending"
          date="Jul 12, 11:45 PM"
          type="sent"
          amountBtc="0.00300000 BTC"
          recipients="1 recipient"
          isApproved={false}
          onClick={handleTransactionClick}
        />
      </div>

      <div className="mt-8 p-4 bg-[#1a1a1a] rounded-lg">
        <Typography variant="h4" className="mb-2">Design Features:</Typography>
        <div className="space-y-1 text-sm text-[#BCBCBC]">
          <div>• 2-column layout: Amount and Your share/To</div>
          <div>• Transaction hash positioned between details and action button</div>
          <div>• Action buttons: &quot;View escrow&quot; (eye icon) or &quot;Manage escrow&quot; (wallet icon)</div>
          <div>• Different icons for received (checkmark) vs sent (arrow)</div>
          <div>• Status badges: Pending (yellow), Active (blue), Completed (green)</div>
          <div>• Bitcoin amounts in orange color (#F9A214)</div>
          <div>• Proper spacing and typography hierarchy</div>
        </div>
      </div>
    </div>
  );
}
