"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/hooks/useUser';
import { setCkbtcBalance } from '@/lib/redux/userSlice';
import { Bitcoin, ExternalLink, RefreshCw } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';


const CKBTCBalance: React.FC = () => {

  const { principal } = useAuth();
  const dispatch = useDispatch()
  const { ckbtcBalance } = useUser()

  // Debug logging
  console.log('🔍 CKBTCBalance component - principal:', principal?.toText());
  console.log('🔍 CKBTCBalance component - ckbtcBalance from Redux:', ckbtcBalance);



  const refreshCkbtcBalance = async () => {
    if (!principal) return;

    try {
      console.log('🔄 Refreshing ckBTC balance for principal:', principal.toText());
      const { createSplitDappActor } = await import('@/lib/icp/splitDapp');
      const actor = await createSplitDappActor();
      const result = await actor.getUserBitcoinBalance(principal) as number;

      console.log('🔄 ckBTC balance result:', result);

      if (typeof result === 'bigint' || typeof result === 'number') {
        const formattedCkbtc = (Number(result) / 1e8).toFixed(8);
        console.log('🔄 Setting ckBTC balance to:', formattedCkbtc);
        dispatch(setCkbtcBalance(formattedCkbtc));
        toast.success('cKBTC balance updated!');
      } else {
        console.error('Failed to get ckBTC balance:', result);
        toast.error('Failed to refresh ckBTC balance');
      }
    } catch (error) {
      console.error('🔄 Error refreshing ckBTC balance:', error);
      toast.error('Failed to refresh ckBTC balance');
    }
  };

  return (
    <Card className="bg-[#222222] border-[#303434]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Bitcoin Balance
          <Bitcoin color="#F97415" size={24} />
        </CardTitle>
        <CardDescription className='text-[#BCBCBC]'>
          Your current Bitcoin balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <Typography variant="h2">
              {ckbtcBalance ? `${ckbtcBalance} ` : 'Loading...'}
            </Typography>
            {ckbtcBalance && (
              <Typography variant="h2" className='text-[#F97415]'>cKBTC</Typography>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshCkbtcBalance}
              className="text-yellow-500 border-yellow-500 hover:bg-yellow-900/20"
            >
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>
        <Button variant="outline" className='mt-4 w-full'>
          <ExternalLink />
          <Typography variant='small'>View on explorer</Typography>
        </Button>
      </CardContent>
    </Card>
  )
};

export default CKBTCBalance;

