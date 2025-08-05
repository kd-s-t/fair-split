"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/ui/typography';
import { Bitcoin, Save, Copy, Check, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { setTitle, setSubtitle, useAppSelector } from '@/lib/redux/store';

export default function IntegrationsPage() {
  const { principal } = useAuth();
  const dispatch = useDispatch();
  const btcAddress = useAppSelector((state) => state.user.btcAddress);
  const btcBalance = useAppSelector((state) => state.user.btcBalance);
  const icpBalance = useAppSelector((state) => state.user.icpBalance);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempAddress, setTempAddress] = useState('');

  useEffect(() => {
    dispatch(setTitle('Integrations'));
    dispatch(setSubtitle('Manage your Bitcoin address'));
  }, [dispatch]);

  // Handle auto-setting Bitcoin address from AI
  useEffect(() => {
    const handleAutoSetBitcoinAddress = async () => {
      try {
        const chatData = sessionStorage.getItem('splitsafe_chat_data');
        if (chatData) {
          const data = JSON.parse(chatData);
          if (data.autoSet && data.bitcoinAddress) {
            // Clear the session storage
            sessionStorage.removeItem('splitsafe_chat_data');
            
            // Check if user already has a Bitcoin address
            if (btcAddress) {
              toast.error('You already have a Bitcoin address set. Please remove the existing address first if you want to change it.');
              return;
            }
            
            // Validate the Bitcoin address
            const address = data.bitcoinAddress;
            if (!address.startsWith('bc1') && !address.startsWith('1') && !address.startsWith('3')) {
              toast.error('Invalid Bitcoin address format. Please provide a valid Bitcoin address.');
              return;
            }
            
            // Set the Bitcoin address automatically
            setIsLoading(true);
            const { createSplitDappActorWithDfxKey } = await import('@/lib/icp/splitDapp');
            const actor = await createSplitDappActorWithDfxKey();
            const success = await actor.setBitcoinAddress(principal, address);
            
            if (success) {
              toast.success(`Bitcoin address ${address} set successfully!`);
            } else {
              toast.error('Failed to set Bitcoin address. Please try again.');
            }
          }
        }
      } catch (error) {
        console.error('Error auto-setting Bitcoin address:', error);
        toast.error('Failed to auto-set Bitcoin address. Please set it manually.');
      } finally {
        setIsLoading(false);
      }
    };

    if (principal) {
      handleAutoSetBitcoinAddress();
    }
  }, [principal, btcAddress]);

  // When editing, initialize tempAddress with the current btcAddress
  const startEditing = () => {
    setTempAddress(btcAddress || '');
    setIsEditing(true);
  };

  const handleSaveBitcoinAddress = async () => {
    const safeAddress = tempAddress || '';
    if (!safeAddress.trim()) {
      toast.error('Please enter a valid Bitcoin address');
      return;
    }

    // Basic Bitcoin address validation
    if (!safeAddress.startsWith('bc1') && !safeAddress.startsWith('1') && !safeAddress.startsWith('3')) {
      toast.error('Please enter a valid Bitcoin address');
      return;
    }

    setIsLoading(true);
    try {
      const { createSplitDappActorWithDfxKey } = await import('@/lib/icp/splitDapp');
      const actor = await createSplitDappActorWithDfxKey();
      const success = await actor.setBitcoinAddress(principal, safeAddress);
      
      if (success) {
        // No need to update local state here, Redux will handle it
        setIsEditing(false);
        toast.success('Bitcoin address updated successfully!');
      } else {
        toast.error('Failed to update Bitcoin address');
      }
    } catch (error) {
      console.error('❌ Error updating Bitcoin address:', error);
      toast.error('Failed to update Bitcoin address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(btcAddress || '');
      setIsCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const handleRemoveAddress = async () => {
    try {
      const { createSplitDappActorWithDfxKey } = await import('@/lib/icp/splitDapp');
      const actor = await createSplitDappActorWithDfxKey();
      const success = await actor.removeBitcoinAddress(principal);
      
      if (success) {
        // No need to update local state here, Redux will handle it
        setIsEditing(false);
        toast.success('Bitcoin address removed');
      } else {
        toast.error('Failed to remove Bitcoin address');
      }
    } catch (error) {
      console.error('❌ Error removing Bitcoin address:', error);
      toast.error('Failed to remove Bitcoin address');
    }
  };

  const cancelEditing = () => {
    setTempAddress('');
    setIsEditing(false);
  };

  if (!principal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-[#222222] border-[#303434] text-white">
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-300">Loading your Bitcoin address...</span>
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
          
          {/* Bitcoin Balance Display */}
          <Card className="bg-[#222222] border-[#303434] text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bitcoin className="text-yellow-500" size={24} />
                Bitcoin Balance
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your current Bitcoin balance
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
                      {btcBalance ? `${btcBalance} BTC` : 'Loading...'}
                    </Typography>
                  </div>
                </div>
                <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                  Bitcoin
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Bitcoin Address Management */}
        <Card className="bg-[#222222] border-[#303434] text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bitcoin className="text-yellow-500" size={24} />
              Bitcoin Address
            </CardTitle>
            <CardDescription className="text-gray-400">
              {btcAddress 
                ? 'Your Bitcoin address for receiving payments'
                : 'Enter your Bitcoin address to receive payments when escrow is released'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {btcAddress && !isEditing ? (
              // Display existing address
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex-1">
                    <Typography variant="small" className="text-gray-400 mb-2">
                      Your Bitcoin Address
                    </Typography>
                    <div className="font-mono text-sm text-gray-200 break-all">
                      {btcAddress}
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
                      onClick={startEditing}
                      className="text-blue-400 border-blue-600 hover:bg-blue-900/20"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAddress}
                      className="text-red-400 border-red-600 hover:bg-red-900/20"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <Typography variant="small" className="text-green-300">
                    <strong>✅ Address configured:</strong> Bitcoin will be automatically sent to this address when escrow is released.
                  </Typography>
                </div>
              </div>
            ) : (
              // Add/Edit address form
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">
                    {isEditing ? 'Update Bitcoin Address' : 'Bitcoin Address'}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter your Bitcoin address (e.g., bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh)"
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    />
                    <Button
                      onClick={handleSaveBitcoinAddress}
                      disabled={isLoading || !tempAddress.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save size={16} />
                      )}
                    </Button>
                    {isEditing && (
                      <Button
                        variant="outline"
                        onClick={cancelEditing}
                        className="text-gray-300 border-gray-600 hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {!btcAddress && !isEditing && (
                  <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <Typography variant="small" className="text-yellow-300">
                      <strong>No Bitcoin address set:</strong> Add your Bitcoin address to receive payments when escrow is released.
                    </Typography>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 