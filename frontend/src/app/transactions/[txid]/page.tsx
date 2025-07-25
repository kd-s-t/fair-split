"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "../../../lib/redux/store";
import { useEffect, useMemo, useState } from "react";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import { Principal } from "@dfinity/principal";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Bitcoin,
  CalendarCheck2,
  CircleAlert,
  CircleAlertIcon,
  CircleCheckBig,
  CircleX,
  CircleXIcon,
  ExternalLink,
  ScanQrCode,
  Shield,
  UsersRound,
  Zap,
} from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TransactionLifecycle } from "@/components/TransactionLifecycle";

export default function TransactionDetailsPage() {
  const [isLoading, setIsLoading] = useState<"release" | "refund" | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
  const [isTxLoading, setIsTxLoading] = useState(true);
  const { txid } = useParams();
  // txid format: "index-sender"
  useEffect(() => {
    const fetchTransaction = async () => {
      if (!txid) return;
      setIsTxLoading(true);
      const [idxStr, ...senderParts] = (txid as string).split("-");
      const idx = Number(idxStr);
      const sender = senderParts.join("-");
      console.log("params1", { id: BigInt(idx), sender: Principal.fromText(sender) });
      console.log("params2", { id: BigInt(idx), sender: sender });
      try {
        const actor = await createSplitDappActor();
        const result = await actor.getTransactionBy(Principal.fromText(sender), BigInt(idx));
        console.log("result", result);
        if (result) {
          setTransaction((result as any[])[0] ?? result);
        } else {
          setTransaction(null);
        }

        setIsTxLoading(false);
      } catch (err) {
        console.error("err", err);
        setTransaction(null);
        setIsTxLoading(false);
      }
    };
    fetchTransaction();
  }, [txid]);
  console.log("transaction", transaction);
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
  if (!transaction) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center text-muted-foreground">Transaction not found.</div>
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

  // Placeholder for initiate escrow logic
  const handleInitiateEscrow = async () => {
    setIsInitiating(true);
    try {
      const [idxStr, ...senderParts] = (txid as string).split("-");
      const idx = Number(idxStr);
      const sender = senderParts.join("-");
      const actor = await createSplitDappActor();
      await actor.initiateEscrow(
        Principal.fromText(
          typeof transaction.from === "string"
            ? transaction.from
            : transaction.from.toText()
        ),
        BigInt(idx)
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

  // Calculate lifecycle step
  const statusKey = transaction.status
    ? Object.keys(transaction.status)[0]
    : "unknown";
  const now = Date.now() / 1000; // seconds
  const txTimestamp = Number(transaction.timestamp);
  const twoHours = 2 * 60 * 60;
  const elapsed = now - txTimestamp;

  // Step order: Locked -> Trigger Met -> Splitting -> Released
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
  // Step labels
  const steps = [
    { label: "Locked" },
    { label: "Trigger Met" },
    { label: "Splitting" },
    { label: "Released" },
  ];

  if (isReleased) {
    return (
      <div className="flex flex-col gap-6">
        <div className="w-full rounded-xl bg-gradient-to-r from-[#1FE29A] to-[#5FFFD7] p-1 mb-4">
          <div className="bg-[#181818] rounded-xl p-6 flex flex-col gap-2">
            <span className="text-lg font-semibold text-[#181818] bg-gradient-to-r from-[#1FE29A] to-[#5FFFD7] bg-clip-text text-transparent">Escrow completed</span>
            <span className="text-[#181818] text-sm">All payments have been successfully distributed to recipients</span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Escrow overview and payment distribution */}
          <div className="container flex-1 !rounded-2xl !px-6 !py-4 text-white bg-[#181818]">
            <Typography variant="h4">Escrow overview</Typography>
            <div className="grid grid-cols-2 gap-6 my-8">
              <div className="flex flex-col gap-2">
                <span className="text-[#9F9F9F] text-xs">Completed on</span>
                <span className="font-semibold">
                  {new Date(Number(transaction.timestamp) * 1000).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[#9F9F9F] text-xs">Transaction</span>
                <span className="font-semibold">{transaction.hash ? transaction.hash : '—'}</span>
              </div>
            </div>
            <Typography variant="h4" className="mb-2">Payment distribution</Typography>
            <div className="flex flex-col gap-4">
              {transaction.to.map((toEntry: any, idx: number) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between bg-[#232323] rounded-xl p-4 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#1FE29A] rounded-full p-1 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#181818" strokeWidth="2" fill="none" /><path d="M7 13l3 3 7-7" stroke="#181818" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                    </span>
                    <div>
                      <div className="font-semibold">Recipient {idx + 1}</div>
                      <div className="text-xs text-[#9F9F9F]">{toEntry.principal}</div>
                      <div className="text-xs text-[#9F9F9F]">Transaction hash<br/>{toEntry.txHash ? toEntry.txHash : '—'}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold">{Number(toEntry.amount) / 1e8} BTC</span>
                    <span className="text-xs text-[#9F9F9F]">{toEntry.percent ? toEntry.percent + '%' : ''}</span>
                    <Button variant="outline" className="mt-2 text-xs px-3 py-1">View</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#232323] rounded-xl p-4 mt-6 text-[#9F9F9F] text-sm">
              Escrow executed via ICP-native BTC API with threshold ECDSA signature.<br/>
              No middleman. No human intervention. Fully automated on-chain execution.
            </div>
          </div>
          {/* Right: Transaction lifecycle */}
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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold mb-4">Manage escrow – Active</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Escrow overview */}
        <div className="container flex-1 !rounded-2xl !px-6 !py-4 text-white">
          <Typography variant="h4">Escrow overview</Typography>
          <div className="grid grid-cols-3 gap-2 my-10">
            <div className="flex flex-col items-center">
              <span className="bg-[#4F3F27] p-2 rounded-full">
                <Bitcoin color="#FEB64D" />
              </span>
              <Typography variant="small" className="text-[#9F9F9F] mt-2">
                Total BTC
              </Typography>
              <span className="font-semibold">
                {transaction.to.reduce(
                  (sum: number, toEntry: any) => sum + Number(toEntry.amount),
                  0
                ) / 1e8}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="bg-[#4F3F27] p-2 rounded-full">
                <UsersRound color="#FEB64D" />
              </span>
              <Typography variant="small" className="text-[#9F9F9F] mt-2">
                Recipients
              </Typography>
              <span className="font-semibold">{transaction.to.length}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="bg-[#4F3F27] p-2 rounded-full">
                <Zap color="#FEB64D" />
              </span>
              <Typography variant="small" className="text-[#9F9F9F] mt-2">
                Status
              </Typography>
              <span className="text-green-400 font-semibold">
                {transaction.status
                  ? Object.keys(transaction.status)[0]
                  : "unknown"}
              </span>
            </div>
          </div>
          <hr className="my-10 text-[#424444] h-[1px]" />

          {/* Pending */}
          <Typography variant="large" className="text-[#FEB64D]">
            Funding required
          </Typography>

          <div className="container-primary mt-4">
            <Typography variant="p" className="text-[#FEB64D] font-semibold">
              Send exactly 0.85000000 BTC to activate escrow
            </Typography>
            <Typography variant="p" className="text-white">
              This address is generated by ICP threshold ECDSA — no bridges, no
              wrap
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
                  Escrow powered by Internet Computer's native Bitcoin
                  integration. No bridge. No wrap. Fully trustless.
                </Typography>
              </div>
            </div>
          </div>
          <hr className="my-8 text-[#424444] h-[1px]"></hr>
          {statusKey === "pending" && !isReleased && (
            <div className="flex items-center gap-4 mt-4">
              <Button variant="outline" className="gap-2 text-[#F64C4C] !border-[#303434] !bg-transparent">
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

          {statusKey !== "pending" && statusKey !== "confirmed" && !isReleased && (
            <div className="flex items-center gap-8">
              <Button
                variant="default"
                className="w-full mt-2 text-sm text-[#0D0D0D] font-medium gap-2 bg-[#FEB64D] hover:bg-[#e6a93c]"
                onClick={handleInitiateEscrow}
                disabled={isInitiating}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#0D0D0D" d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                {isInitiating ? "Initiating..." : "Initiate escrow"}
              </Button>
              <div className="flex items-center gap-2">
                <CircleAlert size={16} color="#FEB64D" />
                <Typography variant="small" className="text-white font-normal">
                  This action cannot be undone. Only available while pending. 1
                </Typography>
              </div>
            </div>
          )}

          {transaction.status &&
            !["pending", "draft", "released"].includes(Object.keys(transaction.status)[0]) && (
              <div className="flex gap-4 mb-2">
                <button
                  className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold cursor-pointer"
                  onClick={handleRelease}
                  disabled={isLoading === "release" || isLoading === "refund"}
                >
                  {isLoading === "release" ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                      Releasing...
                    </span>
                  ) : (
                    "Release payment"
                  )}
                </button>
                <button
                  className="bg-slate-700 px-4 py-2 rounded text-white cursor-pointer"
                  onClick={handleRefund}
                  disabled={isLoading === "release" || isLoading === "refund"}
                >
                  {isLoading === "refund" ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                      Refunding...
                    </span>
                  ) : (
                    "Request refund"
                  )}
                </button>
              </div>
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
