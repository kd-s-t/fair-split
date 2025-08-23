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
import { ArrowUpRight, Bitcoin, Coins, Info, X, AlertCircle, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useUser } from '@/hooks/useUser';
import { Checkbox } from '@/components/ui/checkbox';
import { createSplitDappActor } from '@/lib/icp/splitDapp';
import { useAuth } from '@/contexts/auth-context';

type FormData = z.infer<typeof withdrawFormSchema>;

export default function Withdraw({
  open,
  onClose
}: {
  open: boolean,
  onClose: () => void
}) {
  const { icpBalance, ckbtcBalance } = useUser()
  const { principal } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState<'BTC' | 'ICP'>('BTC');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(withdrawFormSchema),
    defaultValues: {
      amount: "",
      address: "",
      isAcceptedTerms: false
    },
    mode: "onChange"
  });

  const { isAcceptedTerms } = watch();

  // Reset form when currency changes
  const handleCurrencyChange = (currency: 'BTC' | 'ICP') => {
    setSelectedCurrency(currency);
    reset();
    setError(null);
  };

  // Validate amount against available balance
  const validateAmount = (value: string) => {
    const numValue = Number(value);
    const maxBalance = selectedCurrency === 'BTC' ? ckbtcBalance : icpBalance;

    if (maxBalance === null || maxBalance === undefined) {
      return `Unable to verify balance. Please try again.`;
    }

    const maxBalanceNum = Number(maxBalance);
    if (isNaN(maxBalanceNum)) {
      return `Invalid balance format. Please try again.`;
    }

    if (numValue > maxBalanceNum) {
      return `Amount cannot exceed your ${selectedCurrency === 'BTC' ? 'ckBTC' : 'ICP'} balance of ${maxBalance}`;
    }
    return true;
  };

  const onSubmit = async (data: FormData) => {
    if (!isAcceptedTerms || !principal) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate amount against balance
      const amountValidation = validateAmount(data.amount);
      if (amountValidation !== true) {
        setError(amountValidation);
        setIsLoading(false);
        return;
      }

      const actor = await createSplitDappActor();

      // Convert amount to the appropriate unit (e8s for ICP, satoshis for BTC)
      const amountInSmallestUnit = selectedCurrency === 'BTC'
        ? Math.floor(Number(data.amount) * 100_000_000) // Convert BTC to satoshis
        : Math.floor(Number(data.amount) * 100_000_000); // Convert ICP to e8s

      let result: { ok: string } | { err: string };
      if (selectedCurrency === 'BTC') {
        // Call ckBTC to BTC withdrawal
        result = await actor.withdrawBtc(principal, BigInt(amountInSmallestUnit), data.address) as { ok: string } | { err: string };
      } else {
        // Call ICP withdrawal
        result = await actor.withdrawIcp(principal, BigInt(amountInSmallestUnit), data.address) as { ok: string } | { err: string };
      }

      if ('ok' in result) {
        // Success - close modal and reset form
        onClose();
        reset();
        setError(null);
        // You might want to refresh the user's balance here
        window.location.reload(); // Simple refresh for now
      } else {
        setError(result.err);
      }
    } catch (err) {
      console.error('Withdrawal error:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      setError(`Withdrawal failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose} className='!p-0 !bg-[#313030]'>
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className='!border-0 !p-0 !bg-[#313030] shadow-[0_0_32px_rgba(0,0,0,0.04)] !w-[640px]'>
          <CardHeader className="p-6">
            <CardTitle className="flex flex-col items-start">
              <div className="flex justify-between items-start w-full">
                <div className='flex text-left gap-3'>
                  <ArrowUpRight color='#FEB64D' size={20} />
                  <Typography variant="large" className="text-white">Withdraw funds</Typography>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-[#F1F1F1] hover:text-[#FAFAFA] !h-5 !w-5"
                  aria-label="Close withdrawal dialog"
                >
                  <X size={24} />
                </Button>
              </div>
              <Typography variant="muted" className="text-[#BCBCBC]">
                Describe your payment split in natural language
              </Typography>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className='w-full flex items-center bg-[#212121] rounded-xl p-1'>
                <Button
                  type="button"
                  variant={selectedCurrency === 'BTC' ? 'outline' : 'ghost'}
                  onClick={() => handleCurrencyChange('BTC')}
                  className={`flex-1 h-10 ${selectedCurrency === 'BTC'
                    ? 'text-[#FEB64D] border-[#FEB64D] !border !bg-[#2F2F2F] shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                    : 'bg-transparent text-[#A1A1AA]'
                    }`}
                  aria-label="Select ckBTC"
                >
                  <Bitcoin size={20} color={`${selectedCurrency === 'BTC' ? '#FEB64D' : '#F1F1F1'}`} />
                  BTC
                </Button>
                <Button
                  type="button"
                  variant={selectedCurrency === 'ICP' ? 'outline' : 'ghost'}
                  onClick={() => handleCurrencyChange('ICP')}
                  className={`flex-1 h-10 ${selectedCurrency === 'ICP'
                    ? 'text-[#FEB64D] border-[#FEB64D] !border !bg-[#2F2F2F] shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                    : 'bg-transparent text-[#A1A1AA]'
                    }`}
                  aria-label="Select ICP"
                >
                  <Coins size={20} color={`${selectedCurrency === 'ICP' ? '#FEB64D' : '#F1F1F1'}`} />
                  ICP
                </Button>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="amount" className="text-[#A1A1AA] mb-2">
                    {selectedCurrency === 'BTC' ? 'ckBTC' : 'ICP'} amount
                  </Label>

                  <Typography variant="small" className="text-white whitespace-nowrap">
                    {selectedCurrency === 'BTC'
                      ? (ckbtcBalance === null || ckbtcBalance === undefined ? '' : `${ckbtcBalance} ckBTC`)
                      : (icpBalance === null || icpBalance === undefined ? '' : `${icpBalance} ICP`)}
                  </Typography>
                </div>

                <div>
                  <Input
                    id="amount"
                    type="number"
                    step="any"
                    min="0"
                    {...register("amount")}
                    placeholder="0.00000000"
                    className="bg-[#2A2A2A] border-[#5A5E5E] text-[#FAFAFA]"
                    aria-describedby={errors.amount ? "amount-error" : undefined}
                  />
                  {errors.amount && (
                    <div id="amount-error" className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.amount.message}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-[#A1A1AA] mb-2">
                  {selectedCurrency === 'BTC' ? 'Bitcoin address' : 'ICP address'}
                </Label>

                <Input
                  id="address"
                  type="text"
                  {...register("address")}
                  placeholder={`Input ${selectedCurrency === 'BTC' ? 'Bitcoin' : 'ICP'} address here`}
                  className="bg-[#2A2A2A] border-[#5A5E5E] text-[#FAFAFA]"
                  aria-describedby={errors.address ? "address-error" : undefined}
                />
                {errors.address && (
                  <div id="address-error" className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.address.message}
                  </div>
                )}
              </div>

              <div className="bg-[#1F374F] border border-[#007AFF] rounded-[10px] flex items-center gap-3 p-4">
                <Info size={20} color='#71B5FF' />
                <Typography variant="small" className="text-white">
                  {selectedCurrency === 'BTC' ? 'ckBTC to BTC' : 'ICP'} withdrawals will be sent to your selected wallet.
                </Typography>
              </div>

              <div className="mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    id="terms"
                    checked={isAcceptedTerms}
                    onCheckedChange={(checked) => setValue("isAcceptedTerms", checked as boolean)}
                    aria-describedby={errors.isAcceptedTerms ? "terms-error" : undefined}
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
                {errors.isAcceptedTerms && (
                  <div id="terms-error" className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.isAcceptedTerms.message}
                  </div>
                )}
              </div>

              {error && (
                <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-500/30 rounded-md flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <hr className='text-[#424444]' />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="default"
                  disabled={isLoading}
                  className="bg-[#FEB64D] text-black font-medium hover:bg-[#FEB64D]/90"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    'Withdraw'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="bg-transparent text-white border-[#7A7A7A] hover:bg-[#2A2A2A]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Dialog>
  );
} 