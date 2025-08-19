
import { useAuth } from "@/contexts/auth-context";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import { setNewTxId } from "@/lib/redux/escrowSlice";
import { setTransactions } from "@/lib/redux/transactionsSlice";
import { setCkbtcBalance, setSeiBalance } from "@/lib/redux/userSlice";
import { Principal } from "@dfinity/principal";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Recipient = {
  principal: string;
  percentage: number;
};

type FormData = {
  btcAmount: string;
  seiAmount?: string;
  tokenType: 'btc' | 'sei';
  recipients: Recipient[];
  title?: string;
};

export function useEscrowActions(editTxId?: string) {
  const { principal, authClient } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();

  const updateBalance = useCallback(async () => {
    if (principal && authClient) {
      try {
        const actor = await createSplitDappActor();
        
        // Update cKBTC balance
        const balanceResult = await actor.getCkbtcBalance(Principal.fromText(principal.toText())) as { ok: number } | { err: string };
        if ('ok' in balanceResult) {
          const formatted = (Number(balanceResult.ok) / 1e8).toFixed(8);
          dispatch(setCkbtcBalance(formatted));
        } else {
          console.error('Failed to get cKBTC balance:', balanceResult.err);
          dispatch(setCkbtcBalance(null));
        }

        // Update SEI balance
        try {
          const seiBalanceResult = await actor.getSeiBalance(Principal.fromText(principal.toText())) as { ok: number } | { err: string };
          if ('ok' in seiBalanceResult) {
            const formatted = (Number(seiBalanceResult.ok) / 1e6).toFixed(6);
            dispatch(setSeiBalance(formatted));
          } else {
            console.error('Failed to get SEI balance:', seiBalanceResult.err);
            dispatch(setSeiBalance(null));
          }
        } catch (error) {
          console.error('Error updating SEI balance:', error);
          dispatch(setSeiBalance(null));
        }
      } catch (error) {
        console.error('Error updating balances:', error);
        dispatch(setCkbtcBalance(null));
        dispatch(setSeiBalance(null));
      }
    }
  }, [principal, authClient, dispatch]);

  const fetchAndStoreTransactions = useCallback(async () => {
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
  }, [principal, authClient, dispatch]);



  // Function to get Bitcoin address for a principal
  const getBitcoinAddressForPrincipal = useCallback(async (principalText: string): Promise<string> => {
    try {
      const actor = await createSplitDappActor();
      const principalObj = Principal.fromText(principalText);
      const address = await actor.getBitcoinAddress(principalObj);
      console.log(`Raw address from canister for ${principalText}:`, address);
      
      // Return empty string for ICP recipients (no Bitcoin address set)
      if (!address || typeof address !== 'string' || address.trim() === '') {
        console.log(`No address found for ${principalText}, returning empty string for ICP recipient`);
        return "";
      }
      
      console.log(`Found address for ${principalText}:`, address);
      return address;
    } catch (error) {
      console.error('Failed to get Bitcoin address for principal:', principalText, error);
      // Return empty string on error (treat as ICP recipient)
      return "";
    }
  }, []);

  const createEscrow = useCallback(
    async (data: FormData) => {
      
      if (!principal) {
        toast.error("You must be logged in to proceed.");
        return;
      }

      try {
        const actor = await createSplitDappActor();
        const callerPrincipal = principal; // principal is already a Principal object

        console.log('🔄 Escrow creation: Checking balance for principal:', callerPrincipal.toText());
        
        if (data.tokenType === 'btc') {
          const ckbtcBalanceResult = await actor.getCkbtcBalance(callerPrincipal) as { ok: number } | { err: string };
          console.log('🔄 Escrow creation: cKBTC Balance result:', ckbtcBalanceResult);
          
          if ('err' in ckbtcBalanceResult) {
            console.error('🔄 Escrow creation: cKBTC Balance check failed:', ckbtcBalanceResult.err);
            toast.error(`Failed to get Bitcoin balance: ${ckbtcBalanceResult.err}`);
            return;
          }
          
          const ckbtcBalance = BigInt(ckbtcBalanceResult.ok);
          const requiredAmount = BigInt(Math.round(Number(data.btcAmount) * 1e8));
          
          console.log('🔄 Escrow creation: Available cKBTC balance:', ckbtcBalance.toString(), 'satoshis');
          console.log('🔄 Escrow creation: Required amount:', requiredAmount.toString(), 'satoshis');

          if (ckbtcBalance < requiredAmount) {
            console.error('🔄 Escrow creation: Insufficient cKBTC balance');
            toast.error(
              `Insufficient Bitcoin balance. You have ${(Number(ckbtcBalance) / 1e8).toFixed(8)} BTC, but need ${data.btcAmount} BTC`
            );
            return;
          }
        } else if (data.tokenType === 'sei') {
          const seiBalanceResult = await actor.getSeiBalance(callerPrincipal) as { ok: number } | { err: string };
          console.log('🔄 Escrow creation: SEI Balance result:', seiBalanceResult);
          
          if ('err' in seiBalanceResult) {
            console.error('🔄 Escrow creation: SEI Balance check failed:', seiBalanceResult.err);
            toast.error(`Failed to get SEI balance: ${seiBalanceResult.err}`);
            return;
          }
          
          const seiBalance = BigInt(seiBalanceResult.ok);
          const requiredAmount = BigInt(Math.round(Number(data.seiAmount || '0') * 1e6));
          
          console.log('🔄 Escrow creation: Available SEI balance:', seiBalance.toString(), 'usei');
          console.log('🔄 Escrow creation: Required amount:', requiredAmount.toString(), 'usei');

          if (seiBalance < requiredAmount) {
            console.error('🔄 Escrow creation: Insufficient SEI balance');
            toast.error(
              `Insufficient SEI balance. You have ${(Number(seiBalance) / 1e6).toFixed(6)} SEI, but need ${data.seiAmount} SEI`
            );
            return;
          }
        }

        const participants = await Promise.all(
          data.recipients.map(async (r) => {
            let amount: bigint;
            if (data.tokenType === 'btc') {
              amount = BigInt(Math.round(((Number(data.btcAmount) * r.percentage) / 100) * 1e8));
            } else {
              amount = BigInt(Math.round(((Number(data.seiAmount || '0') * r.percentage) / 100) * 1e6));
            }
            
            return {
              principal: Principal.fromText(r.principal),
              amount: amount,
              nickname: r.principal || "Recipient",
              percentage: BigInt(r.percentage),
            };
          })
        );

        console.log('🔄 Escrow creation: Calling initiateEscrow with:', {
          callerPrincipal: callerPrincipal.toText(),
          participants: participants.map(p => ({
            principal: p.principal.toText(),
            amount: p.amount.toString(),
            nickname: p.nickname,
            percentage: p.percentage.toString()
          })),
          title: data.title || ""
        });
        
        const txId = await actor.initiateEscrow(
          callerPrincipal,
          participants,
          data.title || ""
        );
        
        console.log('🔄 Escrow creation: initiateEscrow result:', txId);

        if (typeof txId === "string" && txId.startsWith("Error:")) {
          toast.error(txId);
          return;
        }

        dispatch(setNewTxId(String(txId)));
        await fetchAndStoreTransactions();
        await updateBalance();
        
        // Redirect to transaction management page
        console.log('🔄 Redirecting to transaction page:', `/transactions/${txId}`);
        // Add a small delay to ensure state updates are complete
        setTimeout(() => {
          router.push(`/transactions/${encodeURIComponent(String(txId))}`);
        }, 100);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        toast.error(`Error creating escrow: ${errorMessage}`);
        console.error("Create escrow failed:", err);
      }
    },

    [principal, dispatch, fetchAndStoreTransactions, updateBalance, router]
  );

  const updateEscrow = useCallback(
    async (data: FormData) => {
      if (!principal || !editTxId) {
        toast.error("You must be logged in to proceed.");
        return;
      }

      try {
        const actor = await createSplitDappActor();
        const callerPrincipal = principal; // principal is already a Principal object

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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    [principal, editTxId, getBitcoinAddressForPrincipal]
  );

  return { createEscrow, updateEscrow };
}
