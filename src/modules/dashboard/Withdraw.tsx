"use client"

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Typography } from '@/components/ui/typography';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { withdrawFormSchema } from '@/validation/withdraw';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type FormData = z.infer<typeof withdrawFormSchema>;

export default function Withdraw({
  open,
  onOpenChange
}: {
  open: boolean,
  onOpenChange: () => void
}) {

  const { register, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(withdrawFormSchema),
    defaultValues: {
      amount: "",
      address: "",
    }
  });

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
          Withdraw
        </h2>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Typography variant="large">Escrow setup</Typography>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            <div>

              <Input
                className="mt-1"
                type="text"
                {...register("amount")}
                placeholder="e.g., Freelance project payment"
              />
              {errors.amount && (
                <div className="text-red-400 text-sm mt-1">{errors.amount.message}</div>
              )}
            </div>
            <div>

              <Input
                className="mt-1"
                type="text"
                {...register("address")}
                placeholder="e.g., Freelance project payment"
              />
              {errors.address && (
                <div className="text-red-400 text-sm mt-1">{errors.address.message}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Dialog>
  );
} 