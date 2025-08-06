"use client";

import TransactionForm from "@/modules/escrow/TransactionForm";
import { useAuth } from "@/contexts/auth-context";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import { Recipient } from "@/modules/escrow/types";
import { Principal } from "@dfinity/principal";
import { motion } from "framer-motion";
import { useEffect, useRef, Suspense } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { setTransactions } from "../../lib/redux/transactionsSlice";
import { setTitle as setPageTitle, setSubtitle, useAppSelector } from '@/lib/redux/store';
import { setBtcBalance } from "@/lib/redux/userSlice";
import { useSearchParams } from "next/navigation";
import { ToEntry } from "@/modules/transactions/types";
import { populateEscrowForm } from "@/lib/messaging/formPopulation";

function EscrowPageContent() {
  const searchParams = useSearchParams();
  const editTxId = searchParams.get('edit');
  const { principal, authClient } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (editTxId) {
      dispatch(setPageTitle('Edit escrow'));
      dispatch(setSubtitle('Update your escrow configuration'));
    } else {
      dispatch(setPageTitle('Create new escrow'));
      dispatch(setSubtitle('Configure your secure Bitcoin transaction'));
    }
  }, [dispatch, editTxId]);

  // Function to get Bitcoin address for a principal
  const getBitcoinAddressForPrincipal = async (principalText: string): Promise<string | null> => {
    try {
      const actor = await createSplitDappActor();
      const principalObj = Principal.fromText(principalText);
      const address = await actor.getBitcoinAddress(principalObj);
      console.log(`Raw address from canister for ${principalText}:`, address);
      const result = address ? String(address) : null;
      console.log(`Processed address for ${principalText}:`, result);
      return result;
    } catch (error) {
      console.error('Failed to get Bitcoin address for principal:', principalText, error);
      return null;
    }
  };

  const updateBalance = async () => {
    if (principal && authClient) {
      try {
        const actor = await createSplitDappActor();
        const balance = await actor.getUserBitcoinBalance(Principal.fromText(principal.toText())) as bigint;
        const formatted = (Number(balance) / 1e8).toFixed(8);
        dispatch(setBtcBalance(formatted));
      } catch {
        dispatch(setBtcBalance(null));
      }
    }
  };

  const fetchAndStoreTransactions = async () => {
    if (!principal) return;
    if (!authClient) return;
    const actor = await createSplitDappActor();
    const result = await actor.getTransactionsPaginated(
      Principal.fromText(principal.toText()),
      BigInt(0),
      BigInt(50)
    ) as { transactions: unknown[] };
    const txs = result.transactions || [];
    const serializableTxs = txs.map((tx: unknown) => {
      const txObj = tx as Record<string, unknown>;
      return {
        id: txObj.id as string,
        status: txObj.status as string,
        title: txObj.title as string,
        from: typeof txObj.from === "string" ? txObj.from : (txObj.from as { toText: () => string }).toText(),
        createdAt:
          typeof txObj.createdAt === "bigint"
            ? txObj.createdAt.toString()
            : String(txObj.createdAt),
        confirmedAt: Array.isArray(txObj.confirmedAt) && txObj.confirmedAt.length > 0
          ? txObj.confirmedAt[0].toString()
          : null,
        cancelledAt: Array.isArray(txObj.cancelledAt) && txObj.cancelledAt.length > 0
          ? txObj.cancelledAt[0].toString()
          : null,
        refundedAt: Array.isArray(txObj.refundedAt) && txObj.refundedAt.length > 0
          ? txObj.refundedAt[0].toString()
          : null,
        releasedAt: Array.isArray(txObj.releasedAt) && txObj.releasedAt.length > 0
          ? txObj.releasedAt[0].toString()
          : null,
        readAt: Array.isArray(txObj.readAt) && txObj.readAt.length > 0
          ? txObj.readAt[0].toString()
          : null,
        bitcoinTransactionHash: Array.isArray(txObj.bitcoinTransactionHash) && txObj.bitcoinTransactionHash.length > 0
          ? txObj.bitcoinTransactionHash[0]
          : txObj.bitcoinTransactionHash,
        bitcoinAddress: Array.isArray(txObj.bitcoinAddress) && txObj.bitcoinAddress.length > 0
          ? txObj.bitcoinAddress[0]
          : txObj.bitcoinAddress,
        to: (txObj.to as unknown[]).map((toEntry: unknown) => {
          const entry = toEntry as Record<string, unknown>;
          return {
            ...entry,
            principal:
              entry.principal &&
                typeof entry.principal === "object" &&
                typeof (entry.principal as { toText: () => string }).toText === "function"
                ? (entry.principal as { toText: () => string }).toText()
                : typeof entry.principal === "string"
                  ? entry.principal
                  : String(entry.principal),
            amount:
              typeof entry.amount === "bigint"
                ? entry.amount.toString()
                : String(entry.amount),
            percentage: typeof entry.percentage === "bigint" ? entry.percentage.toString() : String(entry.percentage),
            status: entry.status as unknown,
            name: entry.name as string,
            approvedAt: Array.isArray(entry.approvedAt) && entry.approvedAt.length > 0
              ? entry.approvedAt[0].toString()
              : null,
            declinedAt: Array.isArray(entry.declinedAt) && entry.declinedAt.length > 0
              ? entry.declinedAt[0].toString()
              : null,
            readAt: Array.isArray(entry.readAt) && entry.readAt.length > 0
              ? entry.readAt[0].toString()
              : null,
          };
        }),
      };
    });
    dispatch(setTransactions(serializableTxs));
  };

  return (
    <>
      <motion.div
        className="flex flex-row w-full max-w-[1200px] mx-auto p-6 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <TransactionForm />
      </motion.div>
    </>
  );
}

export default function EscrowPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EscrowPageContent />
    </Suspense>
  );
}
