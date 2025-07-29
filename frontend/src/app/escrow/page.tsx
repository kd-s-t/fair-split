/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import TransactionForm from "@/modules/escrow/Form";
import TransactionSummary from "@/modules/escrow/Summary";
import { useAuth } from "@/contexts/auth-context";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import { Recipient } from "@/modules/escrow/types";
import { Principal } from "@dfinity/principal";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { setTransactions } from "../../lib/redux/transactionsSlice";
import { setTitle as setPageTitle, setSubtitle } from '@/lib/redux/store';

export default function EscrowPage() {
  const [title, setTitle] = useState<string>("");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: "1", principal: "", percentage: 100 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [btcAmount, setBtcAmount] = useState<string>("");
  const { principal, authClient }: { principal: { toText: () => string } | null, authClient: any } =
    useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle('Create new escrow'));
    dispatch(setSubtitle('Configure your secure Bitcoin transaction'));
  }, [dispatch]);
  const [showDialog, setShowDialog] = useState(false);
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
      const autoPercent = count > 0 ? Math.floor(100 / count) : 0;
      const remainder = 100 - autoPercent * count;
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
      const autoPercent = count > 0 ? Math.floor(100 / count) : 0;
      const remainder = 100 - autoPercent * count;
      return filtered.map((r, i) => ({
        ...r,
        percentage: autoPercent + (i === 0 ? remainder : 0),
      }));
    });
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
      // Log environment values (optional for debug)
      console.log("Canister ID:", process.env.NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP);
      console.log("Host:", process.env.NEXT_PUBLIC_DFX_HOST);

      // Refresh login session if needed
      if (!(await authClient.isAuthenticated())) {
        await authClient.login(); // Refresh delegation
      }

      const identity = authClient.getIdentity();
      const actor = await createSplitDappActor(identity);

      const callerPrincipal = Principal.fromText(principal.toText());

      const txId = await actor.initiateEscrow(
        callerPrincipal,
        recipients.map((r) => ({
          principal: Principal.fromText(r.principal),
          amount: BigInt(Math.round(((Number(btcAmount) * r.percentage) / 100) * 1e8)),
        })),
        title || ""
      );

      if (typeof txId === "string" && txId.startsWith("Error:")) {
        toast.error(txId);
        return;
      }

      setNewTxId(txId);
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
    if (!authClient) return;
    const identity = authClient.getIdentity();
    const actor = await createSplitDappActor(identity);
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
          title={title}
          setTitle={setTitle}
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
