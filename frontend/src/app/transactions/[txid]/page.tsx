"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import { Principal } from "@dfinity/principal";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Transaction } from "@/declarations/split_dapp.did";
import {
  Bitcoin,
  CalendarCheck2,
  CircleAlert,
  CircleCheckBig,
  CircleXIcon,
  Copy,
  Shield,
  UsersRound,
  Zap,
  CheckCircle,
  RotateCcw,
  Hash,
} from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TransactionLifecycle } from "@/modules/transactions/Lifecycle";

export default function TransactionDetailsPage() {
  const [isLoading, setIsLoading] = useState<"release" | "refund" | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
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

        // Check if user is authenticated for shared function calls
        const { AuthClient } = await import('@dfinity/auth-client');
        const authClient = await AuthClient.create();
        const isAuthenticated = await authClient.isAuthenticated();

        if (!isAuthenticated) {
          toast.error("Please log in to view transaction details");
          router.push('/transactions');
          return;
        }

        const result = await actor.getTransaction(txid as string, principal);
        if (!result) {
          toast.error("Transaction not found");
          router.push('/transactions');
          return;
        }

        const tx = result as Transaction;
        console.log("result", result);
        setTransaction(tx[0]);
        setIsAuthorized(true);
        setIsTxLoading(false);
      } catch (err) {
        console.error("err", err);
        toast.error("Transaction not found");
        // router.push('/transactions');
      }
    };
    fetchTransaction();
  }, [txid, principal, router]);

  if (isTxLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex flex-col gap-4">
          <div className="h-10 bg-gray-200 animate-pulse rounded w-1/2 mx-auto" />
          <div className="h-32 bg-gray-200 animate-pulse rounded" />
          <div className="h-20 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }
  if (!transaction || !isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center text-muted-foreground">
          Transaction not found.
        </div>
      </div>
    );
  }

  const handleRelease = async () => {
    setIsLoading("release");
    try {
      const actor = await createSplitDappActor();
      await actor.releaseSplit(
        Principal.fromText(
          typeof transaction.from === "string"
            ? transaction.from
            : transaction.from.toText()
        )
      );
      toast.success("Escrow released!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error("Release error:", err);
      toast.error(
        "Failed to release escrow" +
        (err && (err as any).message ? ": " + (err as any).message : "")
      );
    } finally {
      setIsLoading(null);
    }
  };

  const handleRefund = async () => {
    setIsLoading("refund");
    try {
      const actor = await createSplitDappActor();
      await actor.cancelSplit(
        Principal.fromText(
          typeof transaction.from === "string"
            ? transaction.from
            : transaction.from.toText()
        )
      );
      toast.success("Escrow refunded!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error("Refund error:", err);
      toast.error(
        "Failed to refund escrow" +
        (err && (err as any).message ? ": " + (err as any).message : "")
      );
    } finally {
      setIsLoading(null);
    }
  };

  const handleInitiateEscrow = async () => {
    setIsInitiating(true);
    try {
      const actor = await createSplitDappActor();
      await actor.initiateEscrow(
        Principal.fromText(
          typeof transaction.from === "string"
            ? transaction.from
            : transaction.from.toText()
        ),
        transaction.to,
        transaction.title
      );
      toast.success("Escrow initiated!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error("Initiate escrow error:", err);
      toast.error(
        "Failed to initiate escrow" +
        (err && (err as any).message ? ": " + (err as any).message : "")
      );
    } finally {
      setIsInitiating(false);
    }
  };

  const statusKey = transaction.status || "unknown";
  const now = Date.now() / 1000; // seconds
  const txTimestamp = Number(transaction.timestamp);
  const twoHours = 2 * 60 * 60;
  const elapsed = now - txTimestamp;

  let currentStep = 0;
  let isReleased = statusKey === "released";
  if (isReleased) {
    currentStep = 3;
  } else if (statusKey === "confirmed") {
    currentStep = 1;
  } else if (statusKey === "draft") {
    currentStep = 0;
  } else if (statusKey === "pending") {
    if (elapsed < twoHours) {
      currentStep = 0;
    } else {
      currentStep = 2;
    }
  }

  const steps = [
    { label: "Locked" },
    { label: "Trigger Met" },
    { label: "Splitting" },
    { label: "Released" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="text-3xl font-bold mb-4">{transaction.title}</div>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Escrow overview */}
        <div className="container flex-1 !rounded-2xl !px-6 !py-4 text-white">
          <Typography variant="large">Escrow overview</Typography>
          <div className="grid grid-cols-3 gap-2 my-10">
            <div className="flex flex-col items-center">
              <span className="bg-[#4F3F27] p-2 rounded-full">
                <Bitcoin color="#FEB64D" />
              </span>
              <Typography variant="small" className="text-[#9F9F9F] mt-2">
                Total BTC
              </Typography>
              <span className="font-semibold">
                {Array.isArray(transaction.to)
                  ? transaction.to.reduce((sum: number, toEntry: any) => sum + Number(toEntry.amount), 0) / 1e8
                  : 0}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="bg-[#4F3F27] p-2 rounded-full">
                <UsersRound color="#FEB64D" />
              </span>
              <Typography variant="small" className="text-[#9F9F9F] mt-2">
                Recipients
              </Typography>
              <span className="font-semibold">{transaction.to?.length}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="bg-[#4F3F27] p-2 rounded-full">
                <Zap color="#FEB64D" />
              </span>
              <Typography variant="small" className="text-[#9F9F9F] mt-2">
                Status
              </Typography>
              <span className={
                transaction.status === 'confirmed'
                  ? 'text-blue-400 font-semibold'
                  : 'text-green-400 font-semibold'
              }>
                {transaction.status === 'confirmed'
                  ? 'Active'
                  : transaction.status === 'released'
                    ? 'Completed'
                    : transaction.status || 'unknown'}
              </span>
            </div>
          </div>
          <hr className="my-10 text-[#424444] h-[1px]" />

          {statusKey === 'released' && (
            <div className="mb-8">
              <Typography variant="large" className="mb-4">Escrow overview</Typography>
              <div className="flex flex-col md:flex-row gap-8 mb-6">
                <div className="flex items-center gap-3">
                  <span className="bg-[#4F3F27] p-2 rounded-full">
                    <CalendarCheck2 color="#FEB64D" />
                  </span>
                  <div>
                    <Typography variant="small" className="text-[#9F9F9F]">Completed on</Typography>
                    <Typography variant="base" className="text-white font-semibold">
                      {new Date().toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-[#4F3F27] p-2 rounded-full">
                    <Hash color="#FEB64D" />
                  </span>
                  <div>
                    <Typography variant="small" className="text-[#9F9F9F]">Transaction</Typography>
                    <Typography variant="base" className="text-white font-semibold">
                      {transaction.txHash ? `${transaction.txHash.slice(0, 10)}...` : 'a1b2c3d4e5f678901234...'}
                    </Typography>
                  </div>
                </div>
              </div>
              <hr className="my-4 text-[#424444] h-[1px]" />
              <Typography variant="large" className="mb-4">Payment distribution</Typography>
              <div className="flex flex-col gap-4">
                {transaction.to.map((toEntry: any, idx: number) => (
                  <div key={idx} className="bg-[#232323] border border-[#393939] rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#4F3F27] p-2 rounded-full">
                        <CircleCheckBig color="#FEB64D" />
                      </span>
                      <div>
                        <Typography variant="base" className="text-white font-semibold">Recipient {idx + 1}</Typography>
                        <Typography variant="small" className="text-[#9F9F9F]">{
                          toEntry.principal ? String(toEntry.principal) : ''
                        }</Typography>


                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-[160px]">
                      <Typography variant="base" className="text-white font-semibold">{(Number(toEntry.amount) / 1e8).toFixed(8)} BTC</Typography>
                      <Typography variant="small" className="text-[#9F9F9F]">{toEntry.percentage || ''}{toEntry.percentage ? '%' : ''}</Typography>

                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#232323] border border-[#393939] rounded-xl p-4 mt-6">
                <Typography variant="base" className="text-white font-semibold">
                  Escrow executed via ICP-native BTC API with threshold ECDSA signature.
                </Typography>
                <Typography variant="small" className="text-[#9F9F9F]">
                  No middleman. No human intervention. Fully automated on-chain execution.
                </Typography>
              </div>
            </div>
          )}

          {/* Pending */}
          {statusKey !== 'released' &&
            <Typography variant="large" className="text-[#FEB64D]">
              Funding required
            </Typography>
          }

          {/* Pending state: show deposit address, instructions, and trustless info only if not completed */}
          {statusKey !== 'released' && (
            <>
              <Typography variant="small" className="text-[#fff] font-semibold">
                Bitcoin deposit address
              </Typography>
              <div className="grid grid-cols-12 gap-3 mt-2">
                <div className="container-gray col-span-11">
                  bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                </div>
                <div className="container-gray">
                  <Copy />
                </div>
              </div>
              <div className="container-primary mt-4">
                <Typography variant="p" className="text-[#FEB64D] font-semibold">
                  Send exactly{" "}
                  {(Array.isArray(transaction.to)
                    ? transaction.to.reduce(
                      (sum: number, toEntry: any) => sum + Number(toEntry.amount),
                      0
                    ) / 1e8
                    : 0
                  ).toFixed(8)}{" "}
                  BTC to activate escrow
                </Typography>
                <Typography variant="p" className="text-white">
                  This address is generated by ICP threshold ECDSA — no bridges, no wrap
                </Typography>
              </div>
              <div className="container-gray mt-6">
                <div className="flex items-start gap-3">
                  <span className="bg-[#4F3F27] p-2 rounded-full">
                    <Shield color="#FEB64D" />
                  </span>
                  <div>
                    <Typography variant="base" className="text-white font-semibold">
                      Fully Trustless
                    </Typography>
                    <Typography className="text-[#9F9F9F] mt-1">
                      Escrow powered by Internet Computer's native Bitcoin integration. No bridge. No wrap. Fully trustless.
                    </Typography>
                  </div>
                </div>
              </div>
            </>
          )}

          <hr className="my-8 text-[#424444] h-[1px]"></hr>
          {statusKey === "pending" && !isReleased && (
            <div className="flex items-center gap-4 mt-4">
              <Button
                variant="outline"
                className="gap-2 text-[#F64C4C] !border-[#303434] !bg-transparent"
              >
                <CircleXIcon size={16} /> Cancel escrow
              </Button>
              <div className="flex items-center gap-2">
                <CircleAlert size={16} color="#FEB64D" />
                <Typography variant="small" className="text-white font-normal">
                  This action cannot be undone. Only available while pending.
                </Typography>
              </div>
            </div>
          )}

          {statusKey !== "pending" &&
            statusKey !== "confirmed" &&
            !isReleased && (
              <div className="flex items-center gap-8">
                <Button
                  variant="default"
                  className="w-full mt-2 text-sm text-[#0D0D0D] font-medium gap-2 bg-[#FEB64D] hover:bg-[#e6a93c]"
                  onClick={handleInitiateEscrow}
                  disabled={isInitiating}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#0D0D0D"
                      d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"
                    />
                  </svg>
                  {isInitiating ? "Initiating..." : "Initiate escrow"}
                </Button>
                <div className="flex items-center gap-2">
                  <CircleAlert size={16} color="#FEB64D" />
                  <Typography
                    variant="small"
                    className="text-white font-normal"
                  >
                    This action cannot be undone. Only available while pending.
                    1
                  </Typography>
                </div>
              </div>
            )}

          {transaction.status &&
            !["pending", "draft", "released"].includes(transaction.status) && (
              <>
                <div className="w-full mb-3 flex items-center gap-2 rounded-xl bg-[#6B4A1B] border border-[#B8862A] px-4 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#B8862A" /><path d="M12 7v4m0 4h.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span className="text-white font-medium">Note: Release payment only when you're satisfied with the delivered work or received goods.</span>
                </div>
                <div className="flex gap-4 mb-2">
                  <Button
                    variant="default"
                    className="w-1/2 flex items-center justify-center gap-2 text-base font-semibold"
                    onClick={handleRelease}
                    disabled={isLoading === "release" || isLoading === "refund"}
                  >
                    {isLoading === "release" ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                        Releasing...
                      </span>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" /> Release payment
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-1/2 flex items-center justify-center gap-2 text-base font-semibold"
                    onClick={handleRefund}
                    disabled={isLoading === "release" || isLoading === "refund"}
                  >
                    {isLoading === "refund" ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                        Refunding...
                      </span>
                    ) : (
                      <>
                        <RotateCcw className="w-5 h-5" /> Request refund
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
        </div>

        {/* Transaction lifecycle */}
        <Card className="w-full md:w-90 bg-[#222222] border-[#303434] text-white flex flex-col gap-4">
          <Typography variant="large">Transaction lifecycle</Typography>
          <div className="container-primary text-sm">
            Native Bitcoin Escrow — No bridges or wrapped tokens
          </div>
          <TransactionLifecycle currentStep={currentStep} />
          <div className="container-gray text-sm text-[#9F9F9F]">
            This escrow is executed fully on-chain using Internet Computer. No
            human mediation.
          </div>
        </Card>
      </div>
    </div>
  );
}
