"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { useUser } from '@/hooks/useUser';
import { Coins, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useDispatch } from 'react-redux';
import { setIcpBalance } from '@/lib/redux/userSlice';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ICPBalance: React.FC = () => {
  const { icpBalance } = useUser();
  const { principal } = useAuth();
  const dispatch = useDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshBalance = async () => {
    if (!principal) return;
    
    setIsRefreshing(true);
    try {
      const { createSplitDappActor } = await import('@/lib/icp/splitDapp');
      const actor = await createSplitDappActor();
      const icpBalanceResult = await actor.getBalance(principal) as bigint;
      dispatch(setIcpBalance(icpBalanceResult.toString()));
      toast.success('ICP balance updated!');
    } catch (error) {
      console.error('Failed to refresh ICP balance:', error);
      toast.error('Failed to refresh ICP balance');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="bg-[#222222] border-[#303434] text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          ICP Balance
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshBalance}
              disabled={isRefreshing}
              className="p-1 h-auto"
            >
              <RefreshCw 
                className={`h-4 w-4 text-[#007AFF] ${isRefreshing ? 'animate-spin' : ''}`} 
              />
            </Button>
            <Coins color='#007AFF' />
          </div>
        </CardTitle>
        <CardDescription className='text-[#BCBCBC]'>
          Your current ICP balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mt-4">
          <Typography variant="h2">
            {icpBalance ? `${icpBalance}` : 'Loading...'}
          </Typography>

          {icpBalance && (
            <Typography variant="h2" className='text-[#007AFF]'>ICP</Typography>
          )}
        </div>

        <div className='flex items-center gap-2 mt-4'>
          <Typography variant='muted'>Last updated:</Typography>
          <Typography variant='small' className='text-green-500'>Just now</Typography>
        </div>
      </CardContent>
    </Card>
  )
};

export default ICPBalance;
