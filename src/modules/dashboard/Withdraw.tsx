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
    formState: { errors, isValid, isDirty },
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

  const { isAcceptedTerms, amount } = watch();

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
        <Card className='!border-0 !p-0  !bg-[#313030]'>
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <div className='flex text-left gap-2'>
                <ArrowUpRight color='#FEB64D' size={14} />
                <div>
                  <Typography variant="large">Withdraw funds</Typography>
                  <Typography variant="muted" className="text-[#A1A1AA]">
                    Withdraw your funds to your wallet
                  </Typography>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-[#A1A1AA] hover:text-[#FAFAFA]"
                aria-label="Close withdrawal dialog"
              >
                <X size={14} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className='w-full flex items-center'>
                <Button
                  type="button"
                  variant={selectedCurrency === 'BTC' ? 'outline' : 'ghost'}
                  onClick={() => handleCurrencyChange('BTC')}
                  className={`flex-1 h-12 ${selectedCurrency === 'BTC'
                    ? 'text-[#FEB64D] border-[#FEB64D] !border !bg-[#2A2A2A]'
                    : 'bg-[#222222] text-[#A1A1AA]'
                    }`}
                  aria-label="Select ckBTC"
                >
                  <Bitcoin size={14} color={`${selectedCurrency === 'BTC' ? '#FEB64D' : '#F1F1F1'}`} />
                  ckBTC
                </Button>
                <Button
                  type="button"
                  variant={selectedCurrency === 'ICP' ? 'outline' : 'ghost'}
                  onClick={() => handleCurrencyChange('ICP')}
                  className={`flex-1 h-12 ${selectedCurrency === 'ICP'
                    ? 'text-[#FEB64D] border-[#FEB64D] !border !bg-[#2A2A2A]'
                    : 'bg-[#222222] text-[#A1A1AA] border-[#5A5E5E]'
                    }`}
                  aria-label="Select ICP"
                >
                  <Coins size={16} color={`${selectedCurrency === 'ICP' ? '#FEB64D' : '#F1F1F1'}`} />
                  ICP
                </Button>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="amount" className="text-[#A1A1AA] mb-2">
                    {selectedCurrency === 'BTC' ? 'ckBTC' : 'ICP'} amount
                  </Label>

                  <Typography variant="small" className="text-white whitespace-nowrap">
                    {selectedCurrency === 'BTC' ? `${ckbtcBalance} ckBTC` : `${icpBalance} ICP`}
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

              <div className="container-blue flex items-center gap-2">
                <Info size={14} color='#71B5FF' />
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

              <hr className='bg-[#424444]' />
              
              {/* Debug Info */}
              <div className="text-xs text-gray-400 mb-2">
                Debug: isDirty={isDirty.toString()}, isValid={isValid.toString()}, isLoading={isLoading.toString()}
                <div>Amount: &quot;{amount}&quot; (length: {amount.length})</div>
                <div>Address: &quot;{watch('address')}&quot; (length: {watch('address').length})</div>
                <div>Terms: {isAcceptedTerms.toString()}</div>
                <div>Form Values: {JSON.stringify({amount: watch('amount'), address: watch('address'), isAcceptedTerms: watch('isAcceptedTerms')})}</div>
                {Object.keys(errors).length > 0 && (
                  <div>
                    Errors: {Object.keys(errors).map(key => `${key}: ${errors[key as keyof typeof errors]?.message || 'unknown error'}`).join(', ')}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="default"
                  disabled={isLoading}
                  className="flex-1"
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
                  className="bg-[#2A2A2A] text-[#FAFAFA] border-[#5A5E5E] hover:bg-[#3A3A3A]"
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