"use client";

import { Bitcoin, UsersRound, Zap, CircleCheckBig, CircleAlert, Shield, ChevronRight } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";


interface EscrowOverviewProps {
  totalBTC: number;
  recipientCount: number;
  status: string;
  recipients?: Array<{
    id: string;
    amount: number;
    principal: string;
  }>;
  onRelease?: () => void;
  onRefund?: () => void;
  isLoading?: boolean;
}

export default function EscrowOverview({
  totalBTC,
  recipientCount,
  status,
  recipients = [],
  onRelease,
  onRefund,
  isLoading = false
}: EscrowOverviewProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Active';
      case 'released':
        return 'Completed';
      case 'pending':
        return 'Awaiting Deposit';
      case 'cancelled':
        return 'Cancelled';
      case 'declined':
        return 'Declined';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-blue-400';
      case 'released':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'cancelled':
      case 'declined':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Escrow Overview Section */}
      <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-6">
        {/* Title Bar */}
        <div className="flex items-center">
          <Typography variant="large" className="text-white">
            Escrow overview
          </Typography>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6">
          {/* Total BTC Card */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
              <Bitcoin className="w-6 h-6 text-[#FEB64D]" />
            </div>
            <div className="text-center">
              <Typography variant="small" className="text-[#9F9F9F]">
                Total BTC
              </Typography>
              <Typography variant="base" className="text-white font-semibold">
                {totalBTC.toFixed(8)}
              </Typography>
            </div>
          </div>

          {/* Recipients Card */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
              <UsersRound className="w-6 h-6 text-[#FEB64D]" />
            </div>
            <div className="text-center">
              <Typography variant="small" className="text-[#9F9F9F]">
                Recipients
              </Typography>
              <Typography variant="base" className="text-white font-semibold">
                {recipientCount}
              </Typography>
            </div>
          </div>

          {/* Status Card */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#FEB64D]" />
            </div>
            <div className="text-center">
              <Typography variant="small" className="text-[#9F9F9F]">
                Status
              </Typography>
              <Typography variant="base" className={`font-semibold ${getStatusColor(status)}`}>
                {getStatusLabel(status)}
              </Typography>
            </div>
          </div>
        </div>



        {/* Recipients Breakdown */}
        <div>
          <Typography variant="large" className="text-white mb-4">
            Recipients breakdown
          </Typography>
          <div className="border border-[#424444] rounded-[10px] overflow-hidden">
            {recipients.map((recipient, index) => (
              <div
                key={recipient.id}
                className={`p-4 ${index % 2 === 0 ? 'bg-[#2B2B2B]' : 'bg-[#212121]'} border-b border-[#424444] last:border-b-0`}
              >
                <div className="flex justify-between items-center">
                  <Typography variant="base" className="text-white">
                    {recipient.id}
                  </Typography>
                  <Typography variant="base" className="text-white">
                    ${(recipient.amount / 1e8 * 50000).toFixed(2)}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Escrow Actions Section */}
      <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-8">
        <Typography variant="large" className="text-white">
          Escrow actions
        </Typography>

        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={onRelease}
              disabled={isLoading}
              className="bg-[#FEB64D] text-black hover:bg-[#FEB64D]/90 font-semibold h-10"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
              ) : (
                <CircleCheckBig className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Releasing..." : "Release Payment"}
              {!isLoading && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
            <Button
              variant="outline"
              onClick={onRefund}
              disabled={isLoading}
              className="border-[#7A7A7A] text-white hover:bg-[#404040] h-10"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <CircleAlert className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Refunding..." : "Refund"}
            </Button>
          </div>

          {/* Warning Banner */}
          <div className="bg-[#48351A] border border-[#BD822D] rounded-[10px] p-4">
            <div className="flex items-start space-x-3">
              <CircleAlert className="w-5 h-5 text-[#FEB64D] mt-0.5 flex-shrink-0" />
              <Typography variant="small" className="text-white">
                Note: Release payment only when you&apos;re satisfied with the delivered work or received goods.
              </Typography>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
            <div className="flex items-start space-x-3">
              <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#FEB64D]" />
              </div>
              <div className="space-y-2">
                <Typography variant="base" className="text-white font-semibold">
                  Smart contract execution
                </Typography>
                <Typography variant="small" className="text-[#9F9F9F]">
                  Funds are locked and will be released by smart contract logic. No human mediation.
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
