"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import { Principal } from "@dfinity/principal";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { TransactionLifecycle } from "@/modules/transactions/Lifecycle";
import PendingEscrowDetails from "./PendingEscrowDetails";
import ConfirmedEscrowActions from "./ConfirmedEscrowActions";
import ReleasedEscrowDetails from "./ReleasedEscrowDetails";
import type { Transaction } from "@/declarations/split_dapp.did";

export default function TransactionDetailsPage() {
  const [isLoading, setIsLoading] = useState<"release" | "refund" | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isTxLoading, setIsTxLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { txid } = useParams();
  const { principal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!txid || !principal) return;
      setIsTxLoading(true);
      try {
        const actor = await createSplitDappActor();
        const { AuthClient } = await import('@dfinity/auth-client');
        const authClient = await AuthClient.create();
        const isAuthenticated = await authClient.isAuthenticated();

        if (!isAuthenticated) {
          toast.error("Please log in to view transaction details");
          router.push('/transactions');
          return;
        }

        const result = await actor.getTransaction(txid as string, principal);
        if (!Array.isArray(result) || result.length === 0) {
          toast.error("Transaction not found");
          router.push('/transactions');
          return;
        }
        console.log("transaction", result[0]);
        setTransaction(result[0]);
        setIsAuthorized(true);
        setIsTxLoading(false);
      } catch (err) {
        console.error("err", err);
        toast.error("Transaction not found");
      }
    };
    fetchTransaction();
  }, [txid, principal, router]);

  const handleRelease = async (id: unknown) => {
    setIsLoading("release");
    try {
      const actor = await createSplitDappActor();
      await actor.releaseSplit(principal, String(id));
      toast.success("Escrow released!");
    } catch (err) {
      console.error("Release error:", err);
      toast.error("Failed to release escrow");
    } finally {
      setIsLoading(null);
    }
  };

  const handleRefund = async () => {
    setIsLoading("refund");
    try {
      const actor = await createSplitDappActor();
      await actor.cancelSplit(Principal.fromText(
        typeof transaction?.from === "string"
          ? transaction.from
          : transaction?.from?.toText?.() || ""
      ));
      toast.success("Escrow refunded!");
    } catch (err) {
      console.error("Refund error:", err);
      toast.error("Failed to refund escrow");
    } finally {
      setIsLoading(null);
    }
  };

  if (isTxLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!transaction || !isAuthorized) {
    return <div className="p-6 text-center">Transaction not found.</div>;
  }

  const statusKey = transaction.status || "unknown";
  const now = Date.now() / 1000;
  const txTimestamp = Number(transaction.timestamp);
  const twoHours = 2 * 60 * 60;
  const elapsed = now - txTimestamp;

  let currentStep = 0;
  let isReleased = statusKey === "released";
  if (isReleased) currentStep = 3;
  else if (statusKey === "confirmed") currentStep = 1;
  else if (statusKey === "pending") currentStep = elapsed < twoHours ? 0 : 2;

  // Calculate total released BTC for banner
  const totalBTC = Array.isArray(transaction.to)
    ? transaction.to.reduce((sum: number, toEntry: any) => sum + Number(toEntry.amount), 0) / 1e8
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Green banner for released status */}
      {statusKey === "released" && (
        <div className="rounded-xl bg-gradient-to-r from-[#1be37c] to-[#b0ff6c] p-4 flex items-center justify-between mb-2">
          <div>
            <div className="text-lg font-semibold text-black">Escrow completed</div>
            <div className="text-sm text-black/80">All payments have been successfully distributed to recipients</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-black">{totalBTC.toFixed(8)} BTC</div>
            <div className="text-xs text-black/80">BTC Released</div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="container flex-1 rounded-2xl px-6 py-4 text-white">
          <Typography variant="large">Escrow overview</Typography>

          {statusKey === "released" && (
            <ReleasedEscrowDetails transaction={transaction} />
          )}

          {statusKey === "pending" && (
            <PendingEscrowDetails transaction={transaction} />
          )}

          {statusKey === "confirmed" && (
            <ConfirmedEscrowActions
              transaction={transaction}
              isLoading={isLoading}
              onRelease={handleRelease}
              onRefund={handleRefund}
            />
          )}
        </div>

        <Card className="w-full md:w-90 bg-[#222222] border-[#303434] text-white flex flex-col gap-4">
          <Typography variant="large">Transaction lifecycle</Typography>
          <div className="container-primary text-sm">
            Native Bitcoin Escrow — No bridges or wrapped tokens
          </div>
          <TransactionLifecycle currentStep={currentStep} />
          <div className="container-gray text-sm text-[#9F9F9F]">
            This escrow is executed fully on-chain using Internet Computer. No human mediation.
          </div>
        </Card>
      </div>
    </div>
  );
}
