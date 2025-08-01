"use client";

import TransactionForm from "@/modules/escrow/Form";
import TransactionSummary from "@/modules/escrow/Summary";
import { useAuth } from "@/contexts/auth-context";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import { Recipient } from "@/modules/escrow/types";
import { Principal } from "@dfinity/principal";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { setTransactions } from "../../lib/redux/transactionsSlice";
import { setTitle as setPageTitle, setSubtitle } from '@/lib/redux/store';
import { setBtcBalance } from "@/lib/redux/userSlice";

export default function EscrowPage() {
  const [title, setTitle] = useState<string>("");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: "recipient-1", principal: "", percentage: 100 },
  ]);
  const idCounter = useRef(2);

  const generateUniqueId = () => {
    const uniqueId = `recipient-${idCounter.current}`;
    idCounter.current += 1;
    return { uniqueId, newId: idCounter.current - 1 };
  };
  const [isLoading, setIsLoading] = useState(false);
  const [btcAmount, setBtcAmount] = useState<string>("");
  const { principal, authClient } = useAuth();
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
    const { uniqueId, newId } = generateUniqueId();
    setRecipients((prev) => {
      const newRecipients = [
        { id: uniqueId, principal: "", percentage: 0 },
        ...prev,
      ];
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
      const actor = await createSplitDappActor();

      const callerPrincipal = Principal.fromText(principal.toText());

      const txId = await actor.initiateEscrow(
        callerPrincipal,
        recipients.map((r) => ({
          principal: Principal.fromText(r.principal),
          amount: BigInt(Math.round(((Number(btcAmount) * r.percentage) / 100) * 1e8)),
          nickname: r.principal, // Use principal as default nickname
        })),
        title || ""
      );

      if (typeof txId === "string" && txId.startsWith("Error:")) {
        toast.error(txId);
        return;
      }

      setNewTxId(String(txId));
      setShowDialog(true);
      await fetchAndStoreTransactions();
      if (principal && authClient) {
        try {
          const actor = await createSplitDappActor();
          const balance = await actor.getBalance(Principal.fromText(principal.toText()));
          const formatted = (Number(balance) / 1e8).toFixed(8);
          dispatch(setBtcBalance(formatted));
        } catch (err) {
          dispatch(setBtcBalance(null));
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Error initiating escrow: ${errorMessage}`);
      console.error("Initiate escrow failed:", err);
    } finally {
      setIsLoading(false);
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
        ...txObj,
        from: typeof txObj.from === "string" ? txObj.from : (txObj.from as { toText: () => string }).toText(),
        timestamp:
          typeof txObj.timestamp === "bigint"
            ? txObj.timestamp.toString()
            : txObj.timestamp,
        createdAt:
          typeof txObj.createdAt === "bigint"
            ? txObj.createdAt.toString()
            : txObj.createdAt,
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
                : entry.amount,
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
        <TransactionForm
          title={title}
          setTitle={setTitle}
          btcAmount={btcAmount}
          setBtcAmount={setBtcAmount}
          recipients={recipients}
          setRecipients={setRecipients}
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
