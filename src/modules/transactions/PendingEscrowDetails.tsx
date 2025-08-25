"use client";

import { Shield, CircleX, CircleAlert, Bitcoin, Users, Zap, CircleCheckBig, UserRound } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { PendingEscrowDetailsProps } from "./types";
import { motion } from "framer-motion";
import { useMemo } from "react";

export default function PendingEscrowDetails({
  transaction,
  currentUserPrincipal,
  onCancel,
  onApprove,
  onDecline,
  isLoading = null
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
    const userEntry = currentUserPrincipal ? transaction.to.find(entry =>
      String(entry.principal) === String(currentUserPrincipal)
    ) : null;

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
  }, [transaction.to, currentUserPrincipal, totalBTC]);

  // Check if current user has already approved or declined
  const currentUserEntry = currentUserPrincipal ? transaction.to?.find(entry => 
    String(entry.principal) === String(currentUserPrincipal)
  ) : null;
  const hasUserApproved = currentUserEntry && (
    currentUserEntry.approvedAt || 
    (currentUserEntry.status && Object.keys(currentUserEntry.status)[0] === "approved")
  );
  const hasUserDeclined = currentUserEntry && (
    currentUserEntry.declinedAt || 
    (currentUserEntry.status && Object.keys(currentUserEntry.status)[0] === "declined")
  );


  return (
    <div className="space-y-4">
      <div className="container-primary flex items-center gap-2 !bg-[#222222]">
        <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
          <UserRound size={18} />
        </div>
        <div>
          <Typography variant="base" className="font-semibold text-[#FEB64D]">You are a recipient in this escrow.</Typography>
          <Typography variant="small">Your share: {userShare.amount.toFixed(8)} BTC • {userShare.percentage}%</Typography>
        </div>
      </div>
      <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-6">

        <Typography variant="large" className="mb-4">Escrow overview</Typography>
        {/* Stats Information (without cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Your Share Info */}
          <div className="flex flex-col items-center space-y-3">
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

          {/* Total Recipients Info */}
          <div className="flex flex-col items-center space-y-3">
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

          {/* Status Info */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
              <Zap size={24} className="text-[#FEB64D]" />
            </div>
            <div className="text-center">
              <Typography variant="small" className="text-[#9F9F9F]">Status</Typography>
              <Typography variant="base" className={`font-semibold mt-2 ${
                hasUserApproved ? 'text-green-500' : 
                hasUserDeclined ? 'text-red-500' : 
                'text-[#FEB64D]'
              }`}>
                {hasUserApproved ? 'Approved' : 
                 hasUserDeclined ? 'Declined' : 
                 'Pending approval'}
              </Typography>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-[#424444] h-[1px]" />

        {/* Approval Section */}
        <div>
          <Typography variant="large" className="text-white mb-4">
            {hasUserApproved ? 'Approval Status' : 
             hasUserDeclined ? 'Decline Status' : 
             'Approval required'}
          </Typography>

          {/* Status Banner */}
          <div className={`rounded-[10px] p-4 mb-4 ${
            hasUserApproved ? 'bg-green-900/20 border border-green-500' :
            hasUserDeclined ? 'bg-red-900/20 border border-red-500' :
            'bg-[#48342A] border border-[#BD823D]'
          }`}>
            <div className="flex items-start gap-3">
              {hasUserApproved ? (
                <CircleCheckBig size={20} className="text-green-500 mt-0.5" />
              ) : hasUserDeclined ? (
                <CircleX size={20} className="text-red-500 mt-0.5" />
              ) : (
                <CircleAlert size={20} className="text-[#FEB64D] mt-0.5" />
              )}
              <div className="space-y-2">
                <Typography variant="base" className={`font-semibold ${
                  hasUserApproved ? 'text-green-500' :
                  hasUserDeclined ? 'text-red-500' :
                  'text-[#FEB64D]'
                }`}>
                  {hasUserApproved ? 'You have approved this escrow' :
                   hasUserDeclined ? 'You have declined this escrow' :
                   'Review the escrow details and choose your action'}
                </Typography>
                <Typography variant="small" className="text-white">
                  {hasUserApproved ? 'Waiting for other recipients to approve before the escrow can be activated' :
                   hasUserDeclined ? 'This escrow has been declined and will not proceed' :
                   'Once approved, the escrow will be activated and funds will be distributed according to the split'}
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
                  disabled={isLoading === "approve"}
                >
                  {isLoading === "approve" ? (
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                  ) : (
                    <CircleCheckBig size={16} className="mr-2" />
                  )}
                  {isLoading === "approve" ? "Approving..." : "Approve"}
                </Button>
              )}
              {onDecline && (
                <Button
                  variant="outline"
                  className="flex-1 border-[#7A7A7A] text-[#F64C4C] hover:bg-[#F64C4C]/10 h-10"
                  onClick={onDecline}
                  disabled={isLoading === "decline"}
                >
                  {isLoading === "decline" ? (
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                  ) : (
                    <CircleX size={16} className="mr-2" />
                  )}
                  {isLoading === "decline" ? "Declining..." : "Decline"}
                </Button>
              )}
            </div>
          )}

          {/* Warning Text - Only show when action is still needed */}
          {!hasUserApproved && !hasUserDeclined && (
            <div className="flex items-center gap-3 mt-3">
              <CircleAlert size={20} className="text-[#FEB64D]" />
              <Typography variant="small" className="text-white">
                This action cannot be undone.
              </Typography>
            </div>
          )}
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
                disabled={isLoading === "cancel"}
              >
                {isLoading === "cancel" ? (
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                ) : (
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <CircleX size={16} />
                  </motion.div>
                )}
                {isLoading === "cancel" ? "Cancelling..." : "Cancel escrow"}
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
    </div>
  );
}
