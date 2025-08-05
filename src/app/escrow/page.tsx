"use client";

import TransactionForm from "@/modules/escrow/Form";
import TransactionSummary from "@/modules/escrow/Summary";
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
import {
  setTitle,
  setBtcAmount,
  setRecipients,
  addRecipient,
  removeRecipient,
  updateRecipient,
  setIsLoading,
  setShowDialog,
  setNewTxId,
  setEditTxId,
  resetEscrowForm,
} from "@/lib/redux/escrowSlice";

function EscrowPageContent() {
  const searchParams = useSearchParams();
  const editTxId = searchParams.get('edit');
  const idCounter = useRef(2);

  const generateUniqueId = () => {
    const uniqueId = `recipient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { uniqueId, newId: idCounter.current };
  };
  
  const { principal, authClient } = useAuth();
  const dispatch = useDispatch();
  
  // Get state from Redux
  const {
    title,
    btcAmount,
    recipients,
    isLoading,
    showDialog,
    newTxId,
  } = useAppSelector((state) => state.escrow);
  
  // Get Bitcoin address from Redux
  const senderBitcoinAddress = useAppSelector((state) => state.user.btcAddress);

  useEffect(() => {
    if (editTxId) {
      dispatch(setPageTitle('Edit escrow'));
      dispatch(setSubtitle('Update your escrow configuration'));
    } else {
      dispatch(setPageTitle('Create new escrow'));
      dispatch(setSubtitle('Configure your secure Bitcoin transaction'));
    }
  }, [dispatch, editTxId]);

  // Load existing transaction data if in edit mode
  useEffect(() => {
    const loadTransactionForEdit = async () => {
      if (!editTxId || !principal) return;
      
      try {
        const actor = await createSplitDappActor();
        const result = await actor.getTransaction(editTxId, principal);
        
        if (Array.isArray(result) && result.length > 0) {
          const tx = result[0];
                dispatch(setTitle(tx.title));
      
      // Convert recipients to the form format
      const formRecipients = tx.to.map((recipient: ToEntry, index: number) => ({
        id: `recipient-${index + 1}`,
        principal: typeof recipient.principal === "string" ? recipient.principal : (recipient.principal as { toText: () => string }).toText(),
        percentage: Number(recipient.percentage),
        name: recipient.name || ""
      }));
      
      dispatch(setRecipients(formRecipients));
      
      // Calculate total BTC amount
      const totalAmount = tx.to.reduce((sum: number, recipient: ToEntry) => sum + Number(recipient.amount), 0);
      dispatch(setBtcAmount((totalAmount / 1e8).toString()));
        }
      } catch (error) {
        console.error('Failed to load transaction for editing:', error);
        toast.error('Failed to load transaction for editing');
      }
    };

    loadTransactionForEdit();
  }, [editTxId, principal]);

  // Populate form with data from chat system
  useEffect(() => {
    const chatData = populateEscrowForm();
    if (chatData && !editTxId) {
      dispatch(setBtcAmount(chatData.amount));
      
      // Create recipients from the chat data
      const newRecipients = chatData.recipients.map((recipientId: string, index: number) => ({
        id: `recipient-${index + 1}`,
        principal: recipientId,
        percentage: Math.floor(100 / chatData.recipients.length) + (index === 0 ? 100 % chatData.recipients.length : 0),
        name: ""
      }));
      
      dispatch(setRecipients(newRecipients));
      dispatch(setTitle("Escrow created via chat"));
    }
  }, [editTxId]);

  // Reset form when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetEscrowForm());
    };
  }, [dispatch]);

  const totalPercentage = recipients.reduce(
    (sum: number, r: Recipient) => sum + Number(r.percentage),
    0
  );
  const btcAmountNum = Math.round(Number(btcAmount) * 1e8);

  const handleRecipientChange = (
    idx: number,
    field: keyof Recipient,
    value: string | number
  ) => {
    dispatch(updateRecipient({ index: idx, field, value }));
  };

  const handleAddRecipient = () => {
    const { uniqueId } = generateUniqueId();
    const newRecipient: Recipient = { id: uniqueId, principal: "", percentage: 0 };
    
    // Calculate auto percentages
    const newRecipients = [newRecipient, ...recipients];
    const count = newRecipients.length;
    const autoPercent = count > 0 ? Math.floor(100 / count) : 0;
    const remainder = 100 - autoPercent * count;
    
    const updatedRecipients = newRecipients.map((r, idx) => ({
      ...r,
      percentage: autoPercent + (idx === 0 ? remainder : 0),
    }));
    
    dispatch(setRecipients(updatedRecipients));
  };
  
  const handleRemoveRecipient = (idx: number) => {
    if (recipients.length > 1) {
      const filtered = recipients.filter((_, i) => i !== idx);
      const count = filtered.length;
      const autoPercent = count > 0 ? Math.floor(100 / count) : 0;
      const remainder = 100 - autoPercent * count;
      
      const updatedRecipients = filtered.map((r, i) => ({
        ...r,
        percentage: autoPercent + (i === 0 ? remainder : 0),
      }));
      
      dispatch(setRecipients(updatedRecipients));
    }
  };

  const validateForm = () => {
    if (!btcAmountNum || btcAmountNum <= 0) {
      toast.error("Enter a valid BTC amount");
      return false;
    }

    // Check if any percentage is outside 1-100 range
    if (recipients.some((r) => r.percentage < 1 || r.percentage > 100)) {
      toast.error("Each percentage must be between 1-100%");
      return false;
    }

    if (totalPercentage !== 100) {
      toast.error("Total percentage must be 100%");
      return false;
    }

    if (recipients.some((r) => !r.principal)) {
      toast.error("All recipients must have a Principal address");
      return false;
    }

    if (!principal) {
      toast.error("You must be logged in to proceed.");
      return false;
    }

    return true;
  };

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

  const handleCreateEscrow = async () => {
    if (!validateForm()) return;

    dispatch(setIsLoading(true));

    try {
      const actor = await createSplitDappActor();
      const callerPrincipal = Principal.fromText(principal!.toText());

      // Check Bitcoin balance before creating escrow
      const btcBalance = await actor.getUserBitcoinBalance(callerPrincipal) as bigint;
      const requiredAmount = BigInt(Math.round(Number(btcAmount) * 1e8));
      
              if (btcBalance < requiredAmount) {
          toast.error(`Insufficient Bitcoin balance. You have ${(Number(btcBalance) / 1e8).toFixed(8)} BTC, but need ${btcAmount} BTC`);
          dispatch(setIsLoading(false));
          return;
        }

      // Use sender's Bitcoin address from Redux
      const senderAddress = senderBitcoinAddress || null;

      // Get Bitcoin addresses for all recipients
      const participantsWithBitcoinAddresses = await Promise.all(
        recipients.map(async (r) => {
          const bitcoinAddress = await getBitcoinAddressForPrincipal(r.principal);
          console.log(`Bitcoin address for ${r.principal}:`, bitcoinAddress);
          return {
            principal: Principal.fromText(r.principal),
            amount: BigInt(Math.round(((Number(btcAmount) * r.percentage) / 100) * 1e8)),
            nickname: r.principal || "Recipient", // Ensure nickname is never empty
            percentage: BigInt(r.percentage),
            bitcoinAddress: bitcoinAddress,
          };
        })
      );
      
      console.log('Participants with Bitcoin addresses:', participantsWithBitcoinAddresses);

      const txId = await actor.initiateEscrow(
        callerPrincipal,
        participantsWithBitcoinAddresses,
        title || ""
      );

      if (typeof txId === "string" && txId.startsWith("Error:")) {
        toast.error(txId);
        return;
      }

      dispatch(setNewTxId(String(txId)));
      dispatch(setShowDialog(true));

      await fetchAndStoreTransactions();
      await updateBalance();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Error creating escrow: ${errorMessage}`);
      console.error("Create escrow failed:", err);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleUpdateEscrow = async () => {
    if (!validateForm()) return;

    dispatch(setIsLoading(true));

    try {
      const actor = await createSplitDappActor();
      const callerPrincipal = Principal.fromText(principal!.toText());

      // Check if transaction is still editable before updating
      try {
        const currentTx = await actor.getTransaction(editTxId!, principal);
        if (Array.isArray(currentTx) && currentTx.length > 0) {
          const tx = currentTx[0];
          if (tx.status !== "pending") {
            toast.error("Cannot update: Transaction is no longer in pending status");
            window.location.href = `/transactions/${editTxId}`;
            return;
          }
          
          // Check if any recipients have taken action
          const hasRecipientAction = tx.to.some((recipient: ToEntry) => 
            recipient.status && Object.keys(recipient.status)[0] !== "pending"
          );
          
          if (hasRecipientAction) {
            toast.error("Cannot update: Some recipients have already taken action");
            window.location.href = `/transactions/${editTxId}`;
            return;
          }
        }
      } catch {
        toast.error("Failed to verify transaction status");
        window.location.href = `/transactions/${editTxId}`;
        return;
      }

      // Update existing escrow
      const updatedParticipants = await Promise.all(
        recipients.map(async (r) => ({
          principal: Principal.fromText(r.principal),
          amount: BigInt(Math.round(((Number(btcAmount) * r.percentage) / 100) * 1e8)),
          nickname: r.principal, // Use principal as default nickname
          percentage: BigInt(r.percentage),
          bitcoinAddress: await getBitcoinAddressForPrincipal(r.principal),
        }))
      );

      await actor.updateEscrow(callerPrincipal, editTxId!, updatedParticipants);
      toast.success("Escrow updated successfully!");
      
      // Navigate back to transaction details
      window.location.href = `/transactions/${editTxId}`;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Error updating escrow: ${errorMessage}`);
      console.error("Update escrow failed:", err);
    } finally {
      dispatch(setIsLoading(false));
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
        <TransactionForm
          title={title}
          setTitle={(value: string) => dispatch(setTitle(value))}
          btcAmount={btcAmount}
          setBtcAmount={(value: string) => dispatch(setBtcAmount(value))}
          recipients={recipients}
          setRecipients={(value: Recipient[]) => dispatch(setRecipients(value))}
          handleAddRecipient={handleAddRecipient}
          handleRemoveRecipient={handleRemoveRecipient}
          handleRecipientChange={handleRecipientChange}
        />
        <TransactionSummary
          btcAmount={btcAmount}
          recipients={recipients}
          isLoading={isLoading}
          handleInitiateEscrow={editTxId ? handleUpdateEscrow : handleCreateEscrow}
          showDialog={showDialog}
          setShowDialog={(value: boolean) => dispatch(setShowDialog(value))}
          newTxId={newTxId}
          isEditMode={!!editTxId}
        />
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
