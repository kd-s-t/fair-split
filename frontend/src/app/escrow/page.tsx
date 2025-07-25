/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import TransactionForm from "@/components/TransactionForm";
import TransactionSummary from "@/components/TransactionSummary";
import { useAuth } from "@/contexts/auth-context";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import { Recipient } from "@/types/Recipient";
import { Principal } from "@dfinity/principal";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { setTransactions } from "../../lib/redux/transactionsSlice";
import { useRouter } from 'next/navigation';
import { setTitle, setSubtitle } from '@/lib/redux/store';

export default function EscrowPage() {
  const [description, setDescription] = useState<string>("");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: "1", principal: "", percentage: 100 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [btcAmount, setBtcAmount] = useState<string>("");
  const { principal }: { principal: { toText: () => string } | null } =
    useAuth();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setTitle('Create new escrow'));
    dispatch(setSubtitle('Configure your secure Bitcoin transaction'));
  }, [dispatch]);
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [newTxIdx, setNewTxIdx] = useState<number | null>(null);
  const [newTxId, setNewTxId] = useState<string | null>(null);

  const totalPercentage = recipients.reduce(
    (sum, r) => sum + Number(r.percentage),
    0
  );
  const btcAmountNum = Math.round(Number(btcAmount) * 1e8);

  const handleRecipientChange = (
    idx: number,
    field: keyof Recipient,
    value: string | number
  ) => {
    setRecipients((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  const handleAddRecipient = () => {
    setRecipients((prev) => {
      const newRecipients = [
        { id: String(Date.now()), principal: "", percentage: 0 },
        ...prev,
      ];
      // Auto-distribute percentage
      const count = newRecipients.length;
      let autoPercent = count > 0 ? Math.floor(100 / count) : 0;
      let remainder = 100 - autoPercent * count;
      return newRecipients.map((r, idx) => ({
        ...r,
        percentage: autoPercent + (idx === 0 ? remainder : 0),
      }));
    });
  };

  const handleRemoveRecipient = (idx: number) => {
    setRecipients((prev) => {
      const filtered =
        prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev;
      // Auto-distribute percentage
      const count = filtered.length;
      let autoPercent = count > 0 ? Math.floor(100 / count) : 0;
      let remainder = 100 - autoPercent * count;
      return filtered.map((r, i) => ({
        ...r,
        percentage: autoPercent + (i === 0 ? remainder : 0),
      }));
    });
  };
  const handleSplitBill = async () => {
    if (recipients.length === 0 || !principal) {
      toast.error(
        "Please add at least one recipient and make sure you’re logged in."
      );
      return;
    }

    if (!btcAmountNum || btcAmountNum <= 0) {
      toast.error("Invalid BTC amount");
      return;
    }

    if (recipients.some((r) => !r.principal)) {
      toast.error("All recipients must have a valid Principal ID");
      return;
    }

    setIsLoading(true);

    try {
      const actor = await createSplitDappActor();
      const result = await actor.splitBill(
        {
          participants: recipients.map((r) => ({
            principal: Principal.fromText(r.principal),
            amount: Math.round(
              ((Number(btcAmount) * r.percentage) / 100) * 1e8
            ),
          })),
        },
        Principal.fromText(principal.toText())
      );
     
      console.log("Split result:", result);
      await fetchAndStoreTransactions();
    } catch (err: any) {
      toast.error(`Error splitting bill: ${err.message || err}`);
      console.error("Error splitting bill:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateEscrow = async () => {
    if (!btcAmountNum || btcAmountNum <= 0) {
      toast.error("Enter a valid BTC amount");
      return;
    }
    if (totalPercentage !== 100) {
      toast.error("Total percentage must be 100%");
      return;
    }
    if (recipients.some((r) => !r.principal)) {
      toast.error("All recipients must have a Principal address");
      return;
    }
    if (!principal) {
      toast.error("You must be logged in to proceed.");
      return;
    }

    setIsLoading(true);

    try {
      const actor = await createSplitDappActor();
      await actor.createEscrow(
        Principal.fromText(principal.toText()),
        recipients.map((r) => ({
          principal: Principal.fromText(r.principal),
          amount: BigInt(Math.round(((Number(btcAmount) * r.percentage) / 100) * 1e8)),
        })),
        description || ""
      );
      // Fetch transactions to get the new transaction index
      const txs = await actor.getTransactions(Principal.fromText(principal.toText())) as any[];
      const newIdx = txs.length - 1;
      await actor.initiateEscrow(
        Principal.fromText(principal.toText()),
        BigInt(newIdx)
      );
      setNewTxId(`${newIdx}-${principal.toText()}`);
      setShowDialog(true);

      await fetchAndStoreTransactions();
    } catch (err: any) {
      toast.error(`Error initiating escrow: ${err.message || err}`);
      console.error("Initiate escrow failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndStoreTransactions = async () => {
    if (!principal) return;
    const actor = await createSplitDappActor();
    const txs = await actor.getTransactions(
      Principal.fromText(principal.toText())
    ) as any[];
    const serializableTxs = txs.map((tx: any) => ({
      ...tx,
      from: typeof tx.from === "string" ? tx.from : tx.from.toText(),
      timestamp:
        typeof tx.timestamp === "bigint"
          ? tx.timestamp.toString()
          : tx.timestamp,
      to: tx.to.map((toEntry: any) => ({
        ...toEntry,
        principal:
          toEntry.principal &&
          typeof toEntry.principal === "object" &&
          typeof toEntry.principal.toText === "function"
            ? toEntry.principal.toText()
            : typeof toEntry.principal === "string"
            ? toEntry.principal
            : String(toEntry.principal),
        amount:
          typeof toEntry.amount === "bigint"
            ? toEntry.amount.toString()
            : toEntry.amount,
      })),
    }));
    dispatch(setTransactions(serializableTxs as any));
  };

  return (
    <>
      <motion.div
        className="flex flex-row w-full max-w-[1200px] mx-auto p-6 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <TransactionForm
          description={description}
          setDescription={setDescription}
          btcAmount={btcAmount}
          setBtcAmount={setBtcAmount}
          recipients={recipients}
          handleAddRecipient={handleAddRecipient}
          handleRemoveRecipient={handleRemoveRecipient}
          handleRecipientChange={handleRecipientChange}
        />
        <TransactionSummary
          btcAmount={btcAmount}
          recipients={recipients}
          isLoading={isLoading}
          handleInitiateEscrow={handleInitiateEscrow}
          showDialog={showDialog}
          setShowDialog={setShowDialog}
          newTxId={newTxId}
        />
      </motion.div>
    </>
  );
}
