"use client"

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Typography } from '@/components/ui/typography';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { withdrawFormSchema } from '@/validation/withdraw';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Bitcoin, Coins, Info, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useUser } from '@/hooks/useUser';
import { Checkbox } from '@/components/ui/checkbox';

type FormData = z.infer<typeof withdrawFormSchema>;

export default function Withdraw({
  open,
  onClose
}: {
  open: boolean,
  onClose: () => void
}) {
  const { icpBalance, ckbtcBalance } = useUser()
  const [selectedCurrency, setSelectedCurrency] = useState<'BTC' | 'ICP'>('BTC');

  const { watch, register, formState: { errors, isValid, isDirty } } = useForm<FormData>({
    resolver: zodResolver(withdrawFormSchema),
    defaultValues: {
      amount: "",
      address: "",
      isAcceptedTerms: false
    }
  });

  const { isAcceptedTerms } = watch()

  const handleWithdraw = () => {
    if (!isAcceptedTerms) return;

    // Handle withdrawal logic here
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose} className='!p-0 !bg-[#313030]'>
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className='!border-0 !p-0  !bg-[#313030]'>
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <div className='flex text-left gap-2'>
                <ArrowUpRight color='#FEB64D' size={14} />
                <div>
                  <Typography variant="large">Withdraw funds</Typography>
                  <Typography variant="muted" className="text-[#A1A1AA]">
                    Describe your payment split in natural language
                  </Typography>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-[#A1A1AA] hover:text-[#FAFAFA]"
              >
                <X size={14} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            <div className='w-full flex items-center'>
              <Button
                variant={selectedCurrency === 'BTC' ? 'outline' : 'ghost'}
                onClick={() => setSelectedCurrency('BTC')}
                className={`flex-1 h-12 ${selectedCurrency === 'BTC'
                  ? 'text-[#FEB64D] border-[#FEB64D] !border !bg-[#2A2A2A]'
                  : 'bg-[#222222] text-[#A1A1AA]'
                  }`}
              >
                <Bitcoin size={14} color={`${selectedCurrency === 'BTC' ? '#FEB64D' : '#F1F1F1'}`} />
                BTC
              </Button>
              <Button
                variant={selectedCurrency === 'ICP' ? 'outline' : 'ghost'}
                onClick={() => setSelectedCurrency('ICP')}
                className={`flex-1 h-12 ${selectedCurrency === 'ICP'
                  ? 'text-[#FEB64D] border-[#FEB64D] !border !bg-[#2A2A2A]'
                  : 'bg-[#222222] text-[#A1A1AA] border-[#5A5E5E]'
                  }`}
              >
                <Coins size={16} color={`${selectedCurrency === 'ICP' ? '#FEB64D' : '#F1F1F1'}`} />
                ICP
              </Button>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[#A1A1AA] mb-2">
                  {selectedCurrency} amount
                </Label>

                <Typography variant="small" className="text-white whitespace-nowrap">
                  {selectedCurrency === 'BTC' ? `${ckbtcBalance} BTC` : `${icpBalance} ICP`}
                </Typography>
              </div>

              <div>
                <Input
                  type="number"
                  {...register("amount")}
                  placeholder="0.00000000"
                  className="bg-[#2A2A2A] border-[#5A5E5E] text-[#FAFAFA]"
                />
                {errors.amount && (
                  <div className="text-red-400 text-sm mt-1">{errors.amount.message}</div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-[#A1A1AA] mb-2">
                {selectedCurrency === 'BTC' ? 'Bitcoin address' : 'ICP address'}
              </Label>

              <Input
                type="text"
                {...register("address")}
                placeholder={`Input ${selectedCurrency} address here`}
                className="bg-[#2A2A2A] border-[#5A5E5E] text-[#FAFAFA]"
              />
              {errors.address && (
                <div className="text-red-400 text-sm mt-1">{errors.address.message}</div>
              )}
            </div>
            <div className="container-blue flex items-center gap-2">
              <Info size={14} color='#71B5FF' />
              <Typography variant="small" className="text-white">
                {selectedCurrency} withdrawals will be sent to your selected wallet.
              </Typography>
            </div>
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  {...register("isAcceptedTerms")}
                />
                <div className='flex flex-col text-left'>
                  <Typography variant="small" className="text-[#FAFAFA]">
                    Accept terms and conditions
                  </Typography>
                  <Typography variant="small" className="text-[#A1A1AA] mt-1">
                    I understand and accept that crypto payouts cannot be reversed.
                  </Typography>
                </div>
              </label>
            </div>
            <hr className='bg-[#424444]' />
            <div className="flex gap-3">
              <Button
                variant="default"
                onClick={handleWithdraw}
                disabled={!isDirty || !isValid}
              >
                Withdraw
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="bg-[#2A2A2A] text-[#FAFAFA] border-[#5A5E5E] hover:bg-[#3A3A3A]"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Dialog>
  );
} 