"use client"

import React from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';

import { Bitcoin, Check, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface TransactionCardProps {
  title: string;
  status: 'pending' | 'confirmed' | 'released' | 'cancelled' | 'declined' | 'active' | 'completed';
  date: string;
  type: 'sent' | 'received';
  amountBtc: string;
  transactionHash?: string;
  yourShare?: string;
  recipients?: string;
  isApproved?: boolean;
  onClick?: () => void;
  className?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-[#007AFF] text-white';
    case 'completed':
      return 'bg-[#00C287] text-white';
    case 'pending':
      return 'bg-[#FEB64D] text-[#0D0D0D]';
    case 'confirmed':
      return 'bg-[#00C287] text-white';
    case 'released':
      return 'bg-[#00E19C] text-[#0D0D0D]';
    case 'cancelled':
      return 'bg-[#FF6B6B] text-white';
    case 'declined':
      return 'bg-[#FF8E53] text-white';
    default:
      return 'bg-[#007AFF] text-white';
  }
};

const getTypeColor = (type: string) => {
  return type === 'received' ? 'text-[#00C287]' : 'text-[#007AFF]';
};

const getTypeIcon = (type: string) => {
  return type === 'received' ? <Check size={16} /> : <ArrowUpRight size={16} />;
};

const truncateAddress = (address: string, start: number = 6, end: number = 4) => {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export default function TransactionCard({
  title,
  status,
  date,
  type,
  amountBtc,
  transactionHash,
  yourShare,
  recipients,
  isApproved = false,
  onClick,
  className = ""
}: TransactionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card 
        className="bg-[#222222] border-0 rounded-[20px] p-5 hover:bg-[#2a2a2a] transition-colors cursor-pointer"
        onClick={onClick}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          {/* Title Section */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Typography variant="h3" className="text-white text-xl font-semibold">
                {title}
              </Typography>
              <div className={`px-3 py-1 rounded-[14px] text-sm font-medium ${getStatusColor(status)}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
            </div>
            
            {/* Date and Type with Approval */}
            <div className="flex items-center gap-2 text-[#9F9F9F] text-sm">
              <span>{date}</span>
              <span className="text-white">•</span>
              <div className={`flex items-center gap-1 ${getTypeColor(type)}`}>
                {getTypeIcon(type)}
                <span className="capitalize">{type === 'received' ? 'Receiving' : 'Sent'}</span>
              </div>
              {isApproved && (
                <>
                  <span className="text-white">•</span>
                  <span className="text-white">You approved</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-3 gap-6">
          {/* Amount */}
          <div className="space-y-2">
            <Typography variant="small" className="text-[#9F9F9F] text-sm">
              Amount
            </Typography>
            <div className="flex items-center gap-2">
              <Bitcoin size={20} className="text-[#F9A214]" />
              <Typography variant="h4" className="text-white text-lg font-semibold">
                {amountBtc}
              </Typography>
            </div>
          </div>

          {/* To/Your Share */}
          <div className="space-y-2">
            <Typography variant="small" className="text-[#9F9F9F] text-sm">
              {type === 'received' ? 'Your share' : 'To'}
            </Typography>
            <Typography variant="h4" className="text-white text-lg font-semibold">
              {type === 'received' ? (yourShare || '100%') : (recipients || '1 recipient')}
            </Typography>
          </div>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <Typography variant="small" className="text-[#9F9F9F] text-sm">
              Transaction hash
            </Typography>
            <Typography variant="h4" className="text-[#F9A214] text-sm font-mono">
              {transactionHash ? truncateAddress(transactionHash) : '-'}
            </Typography>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
