
import { useAuth } from "@/contexts/auth-context";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import { setNewTxId } from "@/lib/redux/escrowSlice";
import { setTransactions } from "@/lib/redux/transactionsSlice";
import { setBtcBalance } from "@/lib/redux/userSlice";
import { Principal } from "@dfinity/principal";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

type Recipient = {
  principal: string;
  percentage: number;
};

type FormData = {
  btcAmount: string;
  recipients: Recipient[];
  title?: string;
};

export function useEscrowActions(editTxId?: string) {
  const { principal, authClient } = useAuth();
  const dispatch = useDispatch();

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

  const createEscrow = useCallback(
    async (data: FormData) => {
      
      if (!principal) {
        toast.error("You must be logged in to proceed.");
        return;
      }

      try {
        const actor = await createSplitDappActor();
        const callerPrincipal = Principal.fromText(principal.toText());

        const btcBalance = await actor.getUserBitcoinBalance(callerPrincipal) as bigint;
        const requiredAmount = BigInt(Math.round(Number(data.btcAmount) * 1e8));

        if (btcBalance < requiredAmount) {
          toast.error(
            `Insufficient Bitcoin balance. You have ${(Number(btcBalance) / 1e8).toFixed(8)} BTC, but need ${data.btcAmount} BTC`
          );
          return;
        }

        const participants = await Promise.all(
          data.recipients.map(async (r) => ({
            principal: Principal.fromText(r.principal),
            amount: BigInt(Math.round(((Number(data.btcAmount) * r.percentage) / 100) * 1e8)),
            nickname: r.principal || "Recipient",
            percentage: BigInt(r.percentage),
            bitcoinAddress: await getBitcoinAddressForPrincipal(r.principal),
          }))
        );

        const txId = await actor.initiateEscrow(
          callerPrincipal,
          participants,
          data.title || ""
        );

        if (typeof txId === "string" && txId.startsWith("Error:")) {
          toast.error(txId);
          return;
        }

        dispatch(setNewTxId(String(txId)));
        await fetchAndStoreTransactions();
        await updateBalance();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        toast.error(`Error creating escrow: ${errorMessage}`);
        console.error("Create escrow failed:", err);
      }
    },
    [principal, dispatch]
  );

  const updateEscrow = useCallback(
    async (data: FormData) => {
      if (!principal || !editTxId) {
        toast.error("You must be logged in to proceed.");
        return;
      }

      try {
        const actor = await createSplitDappActor();
        const callerPrincipal = Principal.fromText(principal.toText());

        // Verify transaction is still editable
        try {
          const currentTx = await actor.getTransaction(editTxId, principal);
          if (Array.isArray(currentTx) && currentTx.length > 0) {
            const tx = currentTx[0];
            if (tx.status !== "pending") {
              toast.error("Cannot update: Transaction is no longer pending");
              window.location.href = `/transactions/${editTxId}`;
              return;
            }

            const hasAction = tx.to.some(
              (recipient: any) => recipient.status && Object.keys(recipient.status)[0] !== "pending"
            );

            if (hasAction) {
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

        const updatedParticipants = await Promise.all(
          data.recipients.map(async (r) => ({
            principal: Principal.fromText(r.principal),
            amount: BigInt(Math.round(((Number(data.btcAmount) * r.percentage) / 100) * 1e8)),
            nickname: r.principal,
            percentage: BigInt(r.percentage),
            bitcoinAddress: await getBitcoinAddressForPrincipal(r.principal),
          }))
        );

        await actor.updateEscrow(callerPrincipal, editTxId, updatedParticipants);
        toast.success("Escrow updated successfully!");
        window.location.href = `/transactions/${editTxId}`;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        toast.error(`Error updating escrow: ${errorMessage}`);
        console.error("Update escrow failed:", err);
      }
    },
    [principal, editTxId]
  );

  return { createEscrow, updateEscrow };
}
