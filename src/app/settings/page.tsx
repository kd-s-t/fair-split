"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/ui/typography';
import { Bitcoin, Save, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { setTitle, setSubtitle } from '@/lib/redux/store';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const { principal } = useAuth();
  const dispatch = useDispatch();
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    dispatch(setTitle('Settings'));
    dispatch(setSubtitle('Manage your account and preferences'));
  }, [dispatch]);

  useEffect(() => {
    // Load existing Bitcoin address from backend
    const loadBitcoinAddress = async () => {
      if (!principal) return;

      try {
        const { createSplitDappActor } = await import('@/lib/icp/splitDapp');
        const actor = await createSplitDappActor();
        const address = await actor.getBitcoinAddress(principal);
        if (address && Array.isArray(address) && address.length > 0) {
          setBitcoinAddress(address[0]);
        }
      } catch (error) {
        console.error('Failed to load Bitcoin address:', error);
      }
    };

    loadBitcoinAddress();
  }, [principal]);

  const handleSaveBitcoinAddress = async () => {
    if (!bitcoinAddress.trim()) {
      toast.error('Please enter a valid Bitcoin address');
      return;
    }

    // Basic Bitcoin address validation
    if (!bitcoinAddress.startsWith('bc1') && !bitcoinAddress.startsWith('1') && !bitcoinAddress.startsWith('3')) {
      toast.error('Please enter a valid Bitcoin address');
      return;
    }

    setIsLoading(true);
    try {
      const { createSplitDappActor } = await import('@/lib/icp/splitDapp');
      const actor = await createSplitDappActor();
      const success = await actor.setBitcoinAddress(principal, bitcoinAddress);

      if (success) {
        toast.success('Bitcoin address saved successfully!');
      } else {
        toast.error('Invalid Bitcoin address format');
      }
    } catch {
      toast.error('Failed to save Bitcoin address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(bitcoinAddress);
      setIsCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Failed to copy address');
    }
  };

  const handleRemoveAddress = async () => {
    try {
      const { createSplitDappActor } = await import('@/lib/icp/splitDapp');
      const actor = await createSplitDappActor();
      const success = await actor.removeBitcoinAddress(principal);

      if (success) {
        setBitcoinAddress('');
        toast.success('Bitcoin address removed');
      } else {
        toast.error('No Bitcoin address found to remove');
      }
    } catch {
      toast.error('Failed to remove Bitcoin address');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Bitcoin Integration Settings */}
        <Card className="bg-[#222222] border-[#303434] text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bitcoin className="text-yellow-500" size={24} />
              Bitcoin Integration
            </CardTitle>
            <CardDescription className="text-gray-400">
              Link your Bitcoin address to receive payments when escrow is released
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label className="text-gray-200">
                Bitcoin Address
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your Bitcoin address (e.g., bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh)"
                  value={bitcoinAddress}
                  onChange={(e) => setBitcoinAddress(e.target.value)}
                  className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
                <Button
                  onClick={handleSaveBitcoinAddress}
                  disabled={isLoading || !bitcoinAddress.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save size={16} />
                  )}
                </Button>
              </div>
            </div>

            {bitcoinAddress && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <Typography variant="small" className="text-gray-400 mb-1">
                      Your Bitcoin Address
                    </Typography>
                    <div className="font-mono text-sm text-gray-200 break-all">
                      {bitcoinAddress}
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
                      onClick={handleRemoveAddress}
                      className="text-red-400 border-red-600 hover:bg-red-900/20"
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <Typography variant="small" className="text-blue-300">
                    <strong>How it works:</strong> When your escrow is released, Bitcoin will be automatically sent to this address.
                  </Typography>
                </div>
              </div>
            )}

            {!bitcoinAddress && (
              <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <Typography variant="small" className="text-yellow-300">
                  <strong>No Bitcoin address set:</strong> Add your Bitcoin address to receive payments when escrow is released.
                </Typography>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="bg-[#222222] border-[#303434] text-white">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription className="text-gray-400">
              Your SafeSplit account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label className="text-gray-200">
                ICP Principal ID
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value={principal ? principal.toText() : ''}
                  readOnly
                  className="bg-gray-800 border-gray-700 text-gray-300"
                />
                <Badge variant="secondary" className="bg-green-600 text-white">
                  Active
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-gray-800 rounded-lg">
              <Typography variant="small" className="text-gray-400">
                <strong>Note:</strong> Your ICP account is automatically created when you first use SafeSplit.
                All escrow transactions use ICP tokens, which are automatically converted to Bitcoin when released.
              </Typography>
            </div>
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card className="bg-[#222222] border-[#303434] text-white">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription className="text-gray-400">
              How SafeSplit protects your funds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Typography variant="small" className="text-gray-300">
                  Escrow funds are secured by Internet Computer&apos;s threshold ECDSA
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Typography variant="small" className="text-gray-300">
                  No bridges or wrapped tokens - direct Bitcoin integration
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Typography variant="small" className="text-gray-300">
                  Your Bitcoin address is stored locally and never shared
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}