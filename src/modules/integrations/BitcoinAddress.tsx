"use client"

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { useUser } from '@/hooks/useUser';
import { Check, CircleCheckBig, Copy, Edit, Trash2, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const BitcoinAddress: React.FC = () => {
  const { ckbtcAddress } = useUser()
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (!ckbtcAddress) return;

    try {
      await navigator.clipboard.writeText(ckbtcAddress);
      setIsCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Failed to copy address');
    }
  };

  return (
    <div className="container space-y-4 space-x-2 !p-5">
      <div className="flex justify-between">
        <div>
          <Typography variant='h3'>Bitcoin address</Typography>
          <Typography variant='muted'>Your Bitcoin address for receiving payments</Typography>
        </div>
      </div>
      <div className="container flex items-center justify-between">
        <div className='flex items-center gap-2'>
          <div className="bg-[#4F3F27] p-2 rounded-full">
            <Wallet color="#FEB64D" />
          </div>
          <Typography variant='muted'>{ckbtcAddress}</Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAddress}
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAddress}
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            <Edit size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAddress}
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            <Trash2 color="#EB4C5C" size={14} />
          </Button>
        </div>
      </div>
      <div className="container-success flex items-start gap-2">
        <div className="h5">
          <CircleCheckBig color="#00C287" />
        </div>
        <div>
          <Typography variant='base' className='text-[#00C287]'>Address configured</Typography>
          <Typography variant='muted' className='text-white'>Default address will be used when escrows are released, unless otherwise selected.</Typography>
        </div>
      </div>
    </div>
  )
};

export default BitcoinAddress;

