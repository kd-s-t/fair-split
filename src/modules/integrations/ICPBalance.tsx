"use client"

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { useUser } from '@/hooks/useUser';
import { Coins } from 'lucide-react';
import React from 'react';

const ICPBalance: React.FC = () => {
  const { icpBalance } = useUser();

  return (
    <Card className="text-white p-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            ICP Balance
            <Badge className="bg-blue-600 text-white">
              IC
            </Badge>
          </div>
          <Coins color='#007AFF' />
        </CardTitle>
        <CardDescription className='text-[#BCBCBC]'>
          Your current ICP balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mt-4">
          <Typography variant="h2">
            {icpBalance ? `${(Number(icpBalance) / 100_000_000).toFixed(2)}` : 'Loading...'}
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
