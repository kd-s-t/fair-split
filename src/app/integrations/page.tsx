"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/ui/typography';
import { Bitcoin, Copy, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { setTitle, setSubtitle, useAppSelector } from '@/lib/redux/store';
import { setCkbtcAddress, setCkbtcBalance } from '@/lib/redux/userSlice';

export default function IntegrationsPage() {
  const { principal } = useAuth();
  const dispatch = useDispatch();
  const icpBalance = useAppSelector((state) => state.user.icpBalance);
  const ckbtcAddress = useAppSelector((state) => state.user.ckbtcAddress);
  const ckbtcBalance = useAppSelector((state) => state.user.ckbtcBalance);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    dispatch(setTitle('Integrations'));
    dispatch(setSubtitle('Manage your cKBTC wallet'));
  }, [dispatch]);

  // Initialize cKBTC wallet and balance on load
  useEffect(() => {
    const initializeCkbtc = async () => {
      if (!principal) return;
      
      setIsInitializing(true);
      try {
        const { createSplitDappActorWithDfxKey } = await import('@/lib/icp/splitDapp');
        const actor = await createSplitDappActorWithDfxKey();
        
        // Get cKBTC balance
        const balanceResult = await actor.getCkbtcBalance(principal);
        if ('ok' in balanceResult) {
          dispatch(setCkbtcBalance(balanceResult.ok.toString()));
        } else {
          console.error('Failed to get cKBTC balance:', balanceResult.err);
          dispatch(setCkbtcBalance('0'));
        }
        
        // If no cKBTC address exists, generate one
        if (!ckbtcAddress) {
          const walletResult = await actor.requestCkbtcWallet();
          if ('ok' in walletResult) {
            dispatch(setCkbtcAddress(walletResult.ok.btcAddress));
            toast.success('cKBTC wallet generated successfully!');
          } else {
            console.error('Failed to generate cKBTC wallet:', walletResult.err);
            toast.error('Failed to generate cKBTC wallet: ' + walletResult.err);
          }
        }
      } catch (error) {
        console.error('Error initializing cKBTC:', error);
        toast.error('Failed to initialize cKBTC wallet. Please try again.');
      } finally {
        setIsInitializing(false);
      }
    };

    if (principal) {
      initializeCkbtc();
    }
  }, [principal, dispatch, ckbtcAddress]);

  // Generate new cKBTC wallet address
  const generateCkbtcWallet = async () => {
    if (!principal) return;
    
    setIsLoading(true);
    try {
      const { createSplitDappActorWithDfxKey } = await import('@/lib/icp/splitDapp');
      const actor = await createSplitDappActorWithDfxKey();
      const result = await actor.requestCkbtcWallet();
      
      if ('ok' in result) {
        dispatch(setCkbtcAddress(result.ok.btcAddress));
        toast.success('New cKBTC wallet generated successfully!');
      } else {
        toast.error('Failed to generate cKBTC wallet: ' + result.err);
      }
    } catch (error) {
      console.error('Error generating cKBTC wallet:', error);
      toast.error('Failed to generate cKBTC wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh cKBTC balance
  const refreshCkbtcBalance = async () => {
    if (!principal) return;
    
    try {
      const { createSplitDappActorWithDfxKey } = await import('@/lib/icp/splitDapp');
      const actor = await createSplitDappActorWithDfxKey();
      const result = await actor.getCkbtcBalance(principal);
      
      if ('ok' in result) {
        dispatch(setCkbtcBalance(result.ok.toString()));
        toast.success('cKBTC balance updated!');
      } else {
        console.error('Failed to get cKBTC balance:', result.err);
        toast.error('Failed to refresh cKBTC balance');
      }
    } catch (error) {
      console.error('Error refreshing cKBTC balance:', error);
      toast.error('Failed to refresh cKBTC balance');
    }
  };

  // Copy address to clipboard
  const handleCopyAddress = async () => {
    if (!ckbtcAddress) return;
    
    try {
      await navigator.clipboard.writeText(ckbtcAddress);
      setIsCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  if (!principal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-[#222222] border-[#303434] text-white">
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-300">Loading your cKBTC wallet...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-[#222222] border-[#303434] text-white">
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              <span className="ml-3 text-gray-300">Initializing cKBTC wallet...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Balance Display Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ICP Balance Display */}
          <Card className="bg-[#222222] border-[#303434] text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">ICP</span>
                </div>
                ICP Balance
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your current ICP balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">ICP</span>
                  </div>
                  <div>
                    <Typography variant="small" className="text-gray-400">
                      Available Balance
                    </Typography>
                    <Typography variant="h3" className="text-blue-500 font-bold">
                      {icpBalance ? `${icpBalance} ICP` : 'Loading...'}
                    </Typography>
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-500 border-blue-500">
                  ICP
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* cKBTC Balance Display */}
          <Card className="bg-[#222222] border-[#303434] text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bitcoin className="text-yellow-500" size={24} />
                cKBTC Balance
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your current cKBTC balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  <Bitcoin className="text-yellow-500" size={20} />
                  <div>
                    <Typography variant="small" className="text-gray-400">
                      Available Balance
                    </Typography>
                    <Typography variant="h3" className="text-yellow-500 font-bold">
                      {ckbtcBalance ? `${ckbtcBalance} cKBTC` : 'Loading...'}
                    </Typography>
                  </div>
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
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                    cKBTC
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* cKBTC Address Management */}
        <Card className="bg-[#222222] border-[#303434] text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bitcoin className="text-yellow-500" size={24} />
              cKBTC Wallet
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your cKBTC wallet address for receiving Bitcoin payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {ckbtcAddress ? (
              // Display generated address
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex-1">
                    <Typography variant="small" className="text-gray-400 mb-2">
                      Your cKBTC Address
                    </Typography>
                    <div className="font-mono text-sm text-gray-200 break-all">
                      {ckbtcAddress}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
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
                      onClick={generateCkbtcWallet}
                      disabled={isLoading}
                      className="text-blue-400 border-blue-600 hover:bg-blue-900/20"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                      ) : (
                        <RefreshCw size={14} />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <Typography variant="small" className="text-green-300">
                    <strong>✅ Wallet ready:</strong> Bitcoin will be automatically sent to this cKBTC address when escrow is released.
                  </Typography>
                </div>
              </div>
            ) : (
              // Generate wallet button
              <div className="space-y-3">
                <div className="text-center">
                  <Button
                    onClick={generateCkbtcWallet}
                    disabled={isLoading}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating Wallet...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Bitcoin size={16} />
                        Generate cKBTC Wallet
                      </div>
                    )}
                  </Button>
                </div>

                <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <Typography variant="small" className="text-yellow-300">
                    <strong>No cKBTC wallet:</strong> Generate your cKBTC wallet address to receive Bitcoin payments when escrow is released.
                  </Typography>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 