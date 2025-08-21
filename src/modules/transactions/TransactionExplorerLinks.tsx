"use client";

import TransactionHash from "@/components/TransactionHash";
import { EscrowTransaction, NormalizedTransaction } from "./types";

interface TransactionExplorerLinksProps {
  transaction: EscrowTransaction | NormalizedTransaction;
  depositAddress?: string;
}

export default function TransactionExplorerLinks({ transaction, depositAddress }: TransactionExplorerLinksProps) {
  return (
    <>
      {/* Bitcoin Address Block Explorer Links */}
      {depositAddress && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_BLOCKSTREAM_URL || 'https://blockstream.info'}/address/${depositAddress}`, '_blank')}
            className="text-[#4F3F27] hover:text-[#FEB64D] text-sm underline"
          >
            View on Blockstream
          </button>
        </div>
      )}


      {/* Bitcoin Transaction Hash */}
      {transaction.bitcoinTransactionHash && (
        <TransactionHash
          title="Bitcoin Transaction Hash"
          hash={transaction.bitcoinTransactionHash}
          description="Real Bitcoin transaction detected and confirmed"
          explorerLinks={[
            {
              label: "View on Blockstream",
              url: `${process.env.NEXT_PUBLIC_BLOCKSTREAM_URL || 'https://blockstream.info'}/tx/${transaction.bitcoinTransactionHash}`
            }
          ]}
        />
      )}
    </>
  );
} 