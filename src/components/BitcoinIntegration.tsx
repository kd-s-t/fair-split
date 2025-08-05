'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface BitcoinAccount {
  owner: string;
  subaccount?: number[];
}

interface BitcoinBalance {
  ok?: number;
  err?: string;
}

interface BitcoinTransferResult {
  ok?: number;
  err?: string;
}

const BitcoinIntegration: React.FC = () => {
  const [account, setAccount] = useState<BitcoinAccount>({
    owner: '',
    subaccount: null
  });
  const [balance, setBalance] = useState<BitcoinBalance | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transferResult, setTransferResult] = useState<BitcoinTransferResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock canister interface - replace with actual canister calls
  const mockCanister = {
    getBitcoinBalance: async (account: BitcoinAccount): Promise<BitcoinBalance> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ok: Math.floor(Math.random() * 1000000) }; // Mock balance
    },
    transferBitcoin: async (
      fromAccount: BitcoinAccount,
      toAccount: BitcoinAccount,
      amount: number,
      memo: number
    ): Promise<BitcoinTransferResult> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { ok: Math.floor(Math.random() * 100000) }; // Mock transaction ID
    }
  };

  const handleCheckBalance = async () => {
    if (!account.owner) {
      setError('Please enter an account owner');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await mockCanister.getBitcoinBalance(account);
      setBalance(result);
    } catch (err) {
      setError('Failed to check balance');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!account.owner || !recipient || !amount) {
      setError('Please fill in all fields');
      return;
    }

    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const toAccount: BitcoinAccount = {
        owner: recipient,
        subaccount: null
      };

      const result = await mockCanister.transferBitcoin(
        account,
        toAccount,
        numAmount,
        Date.now() // Use current timestamp as memo
      );

      setTransferResult(result);
      if (result.ok) {
        setAmount('');
        setRecipient('');
      }
    } catch (err) {
      setError('Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const formatBitcoinAmount = (satoshis: number): string => {
    const btc = satoshis / 100000000; // Convert satoshis to BTC
    return `${btc.toFixed(8)} BTC`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-yellow-500">₿</span>
            Bitcoin Integration
          </CardTitle>
          <CardDescription>
            Connect your SafeSplit escrow to Bitcoin using cKBTC
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Account Setup */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Account Owner (Principal ID)</label>
            <Input
              placeholder="Enter principal ID (e.g., 2vxsx-fae...)"
              value={account.owner}
              onChange={(e) => setAccount({ ...account, owner: e.target.value })}
            />
          </div>

          {/* Balance Check */}
          <div className="flex gap-2">
            <Button 
              onClick={handleCheckBalance}
              disabled={loading || !account.owner}
              className="flex-1"
            >
              {loading ? 'Checking...' : 'Check Balance'}
            </Button>
          </div>

          {balance && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Bitcoin Balance:</span>
                <Badge variant="secondary" className="text-lg">
                  {balance.ok ? formatBitcoinAmount(balance.ok) : 'Error'}
                </Badge>
              </div>
              {balance.err && (
                <p className="text-red-600 text-sm mt-1">{balance.err}</p>
              )}
            </div>
          )}

          <Separator />

          {/* Transfer Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Transfer Bitcoin</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Principal ID</label>
              <Input
                placeholder="Enter recipient principal ID"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (satoshis)</label>
              <Input
                type="number"
                placeholder="Enter amount in satoshis"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                1 BTC = 100,000,000 satoshis
              </p>
            </div>

            <Button 
              onClick={handleTransfer}
              disabled={loading || !account.owner || !recipient || !amount}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Transfer Bitcoin'}
            </Button>

            {transferResult && (
              <div className={`p-4 rounded-lg ${
                transferResult.ok ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Transfer Result:</span>
                  <Badge variant={transferResult.ok ? "default" : "destructive"}>
                    {transferResult.ok ? 'Success' : 'Failed'}
                  </Badge>
                </div>
                {transferResult.ok && (
                  <p className="text-sm mt-1">
                    Transaction ID: {transferResult.ok}
                  </p>
                )}
                {transferResult.err && (
                  <p className="text-red-600 text-sm mt-1">{transferResult.err}</p>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About cKBTC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>cKBTC</strong> is a Bitcoin representation on the Internet Computer that maintains 1:1 backing with real Bitcoin.
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Native Bitcoin integration on ICP</li>
            <li>Low transaction fees</li>
            <li>Fast finality</li>
            <li>Secure chain-key cryptography</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BitcoinIntegration; 