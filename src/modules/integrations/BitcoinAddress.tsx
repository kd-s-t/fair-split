"use client"

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { Info, Plus, Wallet } from 'lucide-react';

const BitcoinAddress: React.FC = () => {

  return (
    <div className="container space-y-4 space-x-2 !p-5">
      <div className="flex justify-between">
        <div>
          <Typography variant='h3'>Bitcoin address</Typography>
          <Typography variant='muted'>Your Bitcoin address for receiving payments</Typography>
        </div>
        <Button>
          <Plus />
          Add BTC address
        </Button>
      </div>
      <div className="container !p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Label</Label>
            <Input
              placeholder='Ledger wallet'
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input
              placeholder='Ledger wallet'
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button>Save</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
      <div className="container flex items-center gap-2">
        <div className="bg-[#4F3F27] p-2 rounded-full">
          <Wallet color="#FEB64D" />
        </div>
        <div>
          <Typography variant='base'>Trezor wallet</Typography>
          <Typography variant='muted'>bc1q9x5jk2k8v9h3m6n4l5p7r8s1t2u3v4w5x6y7z8a</Typography>
        </div>
      </div>
      <div className="container flex items-center">
        <div className="bg-[#4F3F27] p-2 rounded-full">
          <Wallet color="#FEB64D" />
        </div>
        <div>
          <Typography variant='base'>Trezor wallet</Typography>
          <Typography variant='muted'>bc1q9x5jk2k8v9h3m6n4l5p7r8s1t2u3v4w5x6y7z8a</Typography>
        </div>
      </div>
      <div className="container-blue flex items-start gap-2">
        <div className="h5">
          <Info color="#71B5FF" />
        </div>
        <div>
          <Typography variant='base' className='text-[#71B5FF]'>Address configured</Typography>
          <Typography variant='muted' className='text-white'>Default address will be used when escrows are released, unless otherwise selected.</Typography>
        </div>
      </div>
    </div>
  )
};

export default BitcoinAddress;

