"use client";

import { Shield, CircleX, CircleAlert, Bitcoin, Users, Zap, CircleCheckBig, Settings } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { PendingEscrowDetailsProps } from "./types";
import { motion } from "framer-motion";
import { useMemo } from "react";

export default function PendingEscrowDetails({
  transaction,
  onCancel,
  onApprove,
  onDecline
}: PendingEscrowDetailsProps) {


  const totalBTC =
    Array.isArray(transaction?.to) && transaction.to.length > 0
      ? transaction.to.reduce((sum, toEntry) => sum + Number(toEntry.amount), 0) / 1e8
      : 0;

  const recipientCount = transaction?.to?.length || 0;

  // Calculate user's share from the transaction
  const userShare = useMemo(() => {
    if (!transaction.to || !Array.isArray(transaction.to)) return { amount: 0, percentage: 0 };
    
    // Find the current user's entry in the recipients list
    const userEntry = transaction.to.find(entry => 
      String(entry.principal) === String(transaction.from) || 
      entry.principal === transaction.from
    );
    
    if (userEntry) {
      return {
        amount: Number(userEntry.amount) / 1e8,
        percentage: Number(userEntry.percentage)
      };
    }
    
    // If user is not in recipients, show total
    return {
      amount: totalBTC,
      percentage: 100
    };
  }, [transaction.to, transaction.from, totalBTC]);

  return (
    <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-6">

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Your Share Widget */}
        <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4 flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Bitcoin size={24} className="text-[#FEB64D]" />
          </div>
          <div className="text-center">
            <Typography variant="small" className="text-[#9F9F9F]">Your share</Typography>
            <Typography variant="base" className="text-white font-semibold mt-2">
              {userShare.amount.toFixed(8)} BTC • <span className="text-[#FEB64D]">{userShare.percentage}%</span>
            </Typography>
          </div>
        </div>

        {/* Total Recipients Widget */}
        <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4 flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Users size={24} className="text-[#FEB64D]" />
          </div>
          <div className="text-center">
            <Typography variant="small" className="text-[#9F9F9F]">Total recipients</Typography>
            <Typography variant="base" className="text-white font-semibold mt-2">
              {recipientCount}
            </Typography>
          </div>
        </div>

        {/* Status Widget */}
        <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4 flex flex-col items-center space-y-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Zap size={24} className="text-[#FEB64D]" />
          </div>
          <div className="text-center">
            <Typography variant="small" className="text-[#9F9F9F]">Status</Typography>
            <Typography variant="base" className="text-[#FEB64D] font-semibold mt-2">
              Pending approval
            </Typography>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-[#424444] h-[1px]" />

      {/* Approval Required Section */}
      <div>
        <Typography variant="large" className="text-white mb-4">Approval required</Typography>
        
        {/* Warning Banner */}
        <div className="bg-[#48342A] border border-[#BD823D] rounded-[10px] p-4 mb-4">
          <div className="flex items-start gap-3">
            <CircleAlert size={20} className="text-[#FEB64D] mt-0.5" />
            <div className="space-y-2">
              <Typography variant="base" className="text-[#FEB64D] font-semibold">
                Review the escrow details and choose your action
              </Typography>
              <Typography variant="small" className="text-white">
                Once approved, the escrow will be activated and funds will be distributed according to the split
              </Typography>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(onApprove || onDecline) && (
          <div className="flex flex-col sm:flex-row gap-3">
            {onApprove && (
              <Button
                className="flex-1 bg-[#FEB64D] hover:bg-[#FEB64D]/90 text-black font-semibold h-10"
                onClick={onApprove}
              >
                <CircleCheckBig size={16} className="mr-2" />
                Approve
              </Button>
            )}
            {onDecline && (
              <Button
                variant="outline"
                className="flex-1 border-[#7A7A7A] text-[#F64C4C] hover:bg-[#F64C4C]/10 h-10"
                onClick={onDecline}
              >
                <CircleX size={16} className="mr-2" />
                Decline
              </Button>
            )}
          </div>
        )}

        {/* Warning Text */}
        <div className="flex items-center gap-3 mt-3">
          <CircleAlert size={20} className="text-[#FEB64D]" />
          <Typography variant="small" className="text-white">
            This action cannot be undone.
          </Typography>
        </div>
      </div>

      {/* Trustless Banner */}
      <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
            <Shield size={24} className="text-[#FEB64D]" />
          </div>
          <div className="space-y-2">
            <Typography variant="base" className="text-white font-semibold">
              Escrow powered by Internet Computer
            </Typography>
            <Typography variant="small" className="text-[#9F9F9F]">
              No bridge. No wrap. Fully trustless Bitcoin escrow with threshold ECDSA.
            </Typography>
          </div>
        </div>
      </div>

      {/* Cancel Button for Senders */}
      {transaction.status === "pending" && !transaction.releasedAt && onCancel && (
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            <Button
              variant="outline"
              className="text-[#F64C4C] !border-[#303434] !bg-transparent hover:!border-[#F64C4C] hover:!bg-[#F64C4C]/10"
              onClick={onCancel}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
              >
                <CircleX size={16} />
              </motion.div>
              Cancel escrow
            </Button>
          </motion.div>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CircleAlert size={16} color="#FEB64D" />
            </motion.div>
            <Typography variant="small" className="text-white font-normal">
              This action cannot be undone. Only available while pending.
            </Typography>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
