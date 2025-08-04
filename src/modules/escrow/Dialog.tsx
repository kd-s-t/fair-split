"use client"

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { motion } from 'framer-motion';
import { TransactionDialogProps } from './types';

export default function TransactionDialog({
  open,
  onOpenChange,
  amount,
  onDone,
}: TransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <motion.div 
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative"
        >
          <motion.img 
            src="/check.png" 
            alt="check" 
            className="w-15 h-15 relative z-10"
            animate={{ 
              scale: [1, 1.1, 1],
              filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        
        <h2 className="text-2xl font-bold mb-2 mt-8">
          Escrow initiated
        </h2>
        
        <p className="text-gray-400 mb-6 max-w-md">
          The Bitcoin escrow has been successfully created and is awaiting funding.
        </p>
        
        <div className="w-full bg-[#222222] border border-[#303434] rounded-[10px] p-3 mb-6">
          <Typography variant="muted">
            Send {amount} BTC to the generated deposit to activate the escrow.
          </Typography>
        </div>
        
        <div className="relative overflow-hidden w-full">
          <Button
            className="w-full"
            onClick={onDone}
          >
            Done
          </Button>
        </div>
      </motion.div>
    </Dialog>
  );
} 