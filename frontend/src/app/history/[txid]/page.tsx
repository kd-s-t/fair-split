"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "../../../lib/redux/store";
import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { truncateAddress } from "@/helper/string_helpper";
import { TransactionLifecycle } from "@/components/TransactionLifecycle";

export default function TransactionDetailsPage() {
  const [isLoading, setIsLoading] = useState<"release" | "refund" | null>(null);
  const { txid } = useParams();
  const transactions = useSelector(
    (state: RootState) => state.transactions.transactions
  );
  const transaction = useMemo(() => {
    return transactions.find((tx) => {
      const id = `${tx.from}_${tx.to
        .map((toEntry) => toEntry.principal)
        .join("-")}_${tx.timestamp}`;
      return id === txid;
    });
  }, [transactions, txid]);
  console.log(transaction);
  console.log(
    "Transaction status:",
    transaction && transaction.status
      ? Object.keys(transaction.status)[0]
      : "unknown"
  );
  if (!transaction) {
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
  if (statusKey === "released") {
    currentStep = 3;
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
                  (sum, toEntry) => sum + Number(toEntry.amount),
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

          <div className="mt-2">
            <label className="text-sm font-medium">
              Bitcoin deposit address
            </label>
            <Input
              className="mt-1"
              type="text"
              value={"bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"}
              placeholder="e.g., Freelance project payment"
              onChange={() => {}}
            />
          </div>
          <div className="flex gap-4 w-full mt-4">
            <Button variant="outline" className="gap-2 w-full">
              <ScanQrCode size={16} /> Show QR code
            </Button>
            <Button variant="outline" className="gap-2 w-full">
              <ExternalLink size={16} />
              View on explorer
            </Button>
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
          <div className="flex items-center gap-8">
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

          {/* Pending End*/}

          {/* Active */}
          <div className="container-gray flex items-center justify-between mt-8">
            <div>
              <Typography variant="muted">Transaction hash</Typography>
              <Typography variant="base" className="text-white font-normal">
                a1b2c3d4e5f678901234...
              </Typography>
            </div>
            <Button variant="outline" className="gap-2 !bg-transparent">
              <ExternalLink size={16} /> View on explorer
            </Button>
          </div>

          <hr className="my-8 text-[#424444] h-[1px]" />
          <Card className="bg-[#222222] border-[#303434] text-white flex flex-col gap-4">
            <Typography variant="large">Escrow actions</Typography>
            <div className="flex gap-4">
              <Button variant="default" className="gap-2">
                <CircleCheckBig size={16} /> Release payment
              </Button>
              <Button variant="outline" className="gap-2 !bg-transparent">
                <CircleAlertIcon size={16} /> Request refund
              </Button>
            </div>
            <div className="container-primary flex items-center gap-4">
              <CircleAlert size={16} color="#FEB64D" />
              <Typography variant="p">
                Note: Release payment only when you're satisfied with the
                delivered work or received goods.
              </Typography>
            </div>

            <div className="container-gray mt-6">
              <div className="flex items-start gap-3">
                <span className="bg-[#4F3F27] p-2 rounded-full">
                  <Shield color="#FEB64D" />
                </span>
                <div>
                  <Typography
                    variant="base"
                    className="text-white font-semibold"
                  >
                    Smart contract execution
                  </Typography>
                  <Typography className="text-[#9F9F9F] mt-1">
                    Funds are locked and will be released by smart contract
                    logic. No human mediation.
                  </Typography>
                </div>
              </div>
            </div>
          </Card>

          {/* Active End*/}

          {/* Completed*/}
          <Card className="text-white">
            <Typography variant="large">Escrow actions</Typography>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3">
                <span className="bg-[#4F3F27] p-2 rounded-full">
                  <CalendarCheck2 color="#FEB64D" />
                </span>
                <div>
                  <Typography variant="small" className="text-[#9F9F9F]">
                    Completed on
                  </Typography>
                  <Typography className="font-semibold">
                    July 20, 2024 at 10:45 PM
                  </Typography>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-[#4F3F27] p-2 rounded-full">
                  <CalendarCheck2 color="#FEB64D" />
                </span>
                <div>
                  <Typography variant="small" className="text-[#9F9F9F]">
                    Completed on
                  </Typography>
                  <Typography className="font-semibold">
                    July 20, 2024 at 10:45 PM
                  </Typography>
                </div>
              </div>
            </div>

            <hr className="my-8 text-[#424444] h-[1px]" />

            <Typography variant="large">Payment distribution</Typography>

            <div className="container-gray">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-[#4F3F27] p-2 rounded-full">
                    <CircleCheckBig color="#FEB64D" />
                  </span>
                  <div>
                    <Typography variant="base">Recipient 1</Typography>
                    <Typography variant="muted">bc1qxy2k...fjhx0wlh</Typography>
                  </div>
                </div>
                <div>
                  <Typography variant="base">0.85000000 BTC</Typography>
                  <Typography variant="muted">60%</Typography>
                </div>
              </div>
            </div>
          </Card>
          {/* Completed End*/}

          {/* Add refund/release buttons if status is pending */}
          {transaction.status &&
            Object.keys(transaction.status)[0] === "pending" && (
              <div className="flex gap-4 mb-2">
                <button
                  className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold cursor-pointer"
                  onClick={handleRelease}
                  disabled={isLoading === "release" || isLoading === "refund"}
                >
                  {isLoading === "release" ? "Releasing..." : "Release payment"}
                </button>
                <button
                  className="bg-slate-700 px-4 py-2 rounded text-white cursor-pointer"
                  onClick={handleRefund}
                  disabled={isLoading === "release" || isLoading === "refund"}
                >
                  {isLoading === "refund" ? "Refunding..." : "Request refund"}
                </button>
              </div>
            )}
          <div className="mb-4">
            <div className="text-xs text-slate-400 mb-1">Transaction from</div>
            <div className="bg-slate-800 rounded px-2 py-1 font-mono text-xs flex items-center justify-between">
              <span>
                {typeof transaction.from === "string"
                  ? transaction.from
                  : transaction.from.toText
                  ? transaction.from.toText()
                  : transaction.from.toString()}
              </span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Recipients breakdown</h3>
            <div className="space-y-1">
              {transaction.to.map((toEntry, idx) => (
                <div
                  key={idx}
                  className="flex justify-between bg-slate-800 rounded px-2 py-1 text-xs font-mono"
                >
                  <span>
                    {typeof toEntry.principal === "string"
                      ? toEntry.principal
                      : toEntry.principal.toText
                      ? toEntry.principal.toText()
                      : toEntry.principal.toString()}
                  </span>
                  <span>{(Number(toEntry.amount) / 1e8).toFixed(8)} BTC</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction lifecycle */}
        <Card className="w-full md:w-90 bg-[#222222] border-[#303434] text-white flex flex-col gap-4">
          <Typography variant="large">Transaction lifecycle</Typography>
          <div className="container-primary text-sm">
            Native Bitcoin Escrow — No bridges or wrapped tokens
          </div>
          <TransactionLifecycle currentStep={3} />
          <div className="container-gray text-sm text-[#9F9F9F]">
            This escrow is executed fully on-chain using Internet Computer. No
            human mediation.
          </div>
        </Card>
      </div>
    </div>
  );
}
