"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { useAuth } from '@/contexts/auth-context';
import { useUser } from '@/hooks/useUser';
import { Bitcoin, ExternalLink } from 'lucide-react';


const CKBTCBalance: React.FC = () => {

  const { principal } = useAuth();
  const { ckbtcBalance } = useUser()

  // Debug logging
  console.log('🔍 CKBTCBalance component - principal:', principal?.toText());
  console.log('🔍 CKBTCBalance component - ckbtcBalance from Redux:', ckbtcBalance);
  console.log('🔍 CKBTCBalance component - ckbtcBalance type:', typeof ckbtcBalance);
  console.log('🔍 CKBTCBalance component - ckbtcBalance value:', ckbtcBalance);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            Bitcoin Balance
            <span className="text-xs bg-orange-600 px-2 py-1 rounded-full">
              cKBTC
            </span>
            <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">
              Local Testnet
            </span>
          </div>
          <Bitcoin color="#F97415" size={24} />
        </CardTitle>
        <CardDescription className='text-[#BCBCBC]'>
          Your current Bitcoin balance via cKBTC
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Typography variant="h2">
              {ckbtcBalance ? `${ckbtcBalance} ` : 'Loading...'}
            </Typography>
            {ckbtcBalance && (
              <Typography variant="h2" className='text-[#F97415]'>cKBTC</Typography>
            )}
          </div>
          <div className="text-sm text-gray-400">
            Chain-Key Bitcoin Token
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>Network: Local Testnet</div>
            <div>Integration: cKBTC on Internet Computer</div>
            <div className="text-yellow-400">⚠️ Local Development - Real cKBTC on mainnet</div>
          </div>
        </div>
      </CardContent>

      <div className="px-6 pb-6 pt-4">
        <Button variant="outline" className='w-full bg-[#1a1a1a] border-[#404040] text-white hover:bg-[#2a2a2a]'>
          <ExternalLink className="w-4 h-4 mr-2" />
          <Typography variant='small'>View on explorer</Typography>
        </Button>
      </div>
    </Card>
  )
};

export default CKBTCBalance;

