/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { createSplitDappActor } from '@/lib/icp/splitDapp'
import { Principal } from '@dfinity/principal'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux';
import { setTransactions } from '../../lib/redux/transactionsSlice';

interface Recipient {
  id: string
  principal: string
  percentage: number
}

export default function EscrowPage() {
  const [description, setDescription] = useState<string>('')
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', principal: 'modgw-in3j2-6e4ze-4gcda-sixdn-4wj5m-wezzo-3v5gy-nfsz5-5skqf-yqe', percentage: 0 },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [btcBalance, setBtcBalance] = useState<string | null>(null)
  const [isBalanceLoading, setIsBalanceLoading] = useState(false)
  const [btcAmount, setBtcAmount] = useState<string>('')
  const { principal }: { principal: { toText: () => string } | null } = useAuth()
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!principal) return
      setIsBalanceLoading(true)
      try {
        const actor = await createSplitDappActor()
        const principalObj = Principal.fromText(principal.toText())
        const balance = await actor.getBalance(principalObj)
        setBtcBalance((Number(balance) / 1e8).toFixed(8))
      } catch (err) {
        console.error("err", err)
        setBtcBalance(null)
      } finally {
        setIsBalanceLoading(false)
      }
    }
    fetchBalance()
  }, [principal])

  const totalPercentage = recipients.reduce((sum, r) => sum + Number(r.percentage), 0)
  const btcAmountNum = Math.round(Number(btcAmount) * 1e8)

  const handleRecipientChange = (idx: number, field: keyof Recipient, value: string | number) => {
    setRecipients(prev =>
      prev.map((r, i) =>
        i === idx ? { ...r, [field]: value } : r
      )
    )
  }

  const handleAddRecipient = () => {
    setRecipients(prev => [
      { id: String(Date.now()), principal: '', percentage: 0 },
      ...prev,
    ])
  }

  const handleRemoveRecipient = (idx: number) => {
    setRecipients(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev)
  }
  const handleSplitBill = async () => {
    if (recipients.length === 0 || !principal) {
      toast.error('Please add at least one recipient and make sure you’re logged in.')
      return
    }

    if (!btcAmountNum || btcAmountNum <= 0) {
      toast.error('Invalid BTC amount')
      return
    }

    if (recipients.some(r => !r.principal)) {
      toast.error('All recipients must have a valid Principal ID');
      return;
    }

    setIsLoading(true)

    try {
      const actor = await createSplitDappActor()
      const result = await actor.splitBill(
        {
          participants: recipients.map(r => ({
            principal: Principal.fromText(r.principal),
            amount: Math.round(Number(btcAmount) * r.percentage / 100 * 1e8),
          })),
        },
        Principal.fromText(principal.toText())
      )
      toast.success('Bill split successfully!', {
        description: 'The BTC was successfully distributed to recipients.',
        action: {
          label: 'Dismiss',
          onClick: () => toast.dismiss(),
        },
      })
      console.log('Split result:', result)
      await fetchAndStoreTransactions();
    } catch (err: any) {
      toast.error(`Error splitting bill: ${err.message || err}`)
      console.error('Error splitting bill:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInitiateEscrow = async () => {
    if (!btcAmountNum || btcAmountNum <= 0) {
      toast.error('Enter a valid BTC amount')
      return
    }
    if (totalPercentage !== 100) {
      toast.error('Total percentage must be 100%')
      return
    }
    if (recipients.some(r => !r.principal)) {
      toast.error('All recipients must have a Principal address')
      return
    }

    await handleSplitBill()
  }

  const fetchAndStoreTransactions = async () => {
    if (!principal) return;
    const actor = await createSplitDappActor();
    const txs = await actor.getTransactions(Principal.fromText(principal.toText()));
    const serializableTxs = txs.map(tx => ({
      ...tx,
      from: typeof tx.from === 'string' ? tx.from : tx.from.toText(),
      timestamp: typeof tx.timestamp === 'bigint' ? tx.timestamp.toString() : tx.timestamp,
      to: tx.to.map(toEntry => ({
        ...toEntry,
        principal: toEntry.principal && typeof toEntry.principal === 'object' && typeof toEntry.principal.toText === 'function'
          ? toEntry.principal.toText()
          : (typeof toEntry.principal === 'string'
              ? toEntry.principal
              : String(toEntry.principal)),
        amount: typeof toEntry.amount === 'bigint' ? toEntry.amount.toString() : toEntry.amount,
      })),
    }));
    dispatch(setTransactions(serializableTxs));
  };


  return (
    <motion.div
      className="flex flex-row w-full max-w-[1200px] mx-auto p-6 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Main form: 60% */}
      <div className="w-[60%] min-w-[340px]">
        <Card>
          <CardHeader>
            <CardTitle>Escrow setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">amount</label>
                <span className="text-xs text-muted-foreground">
                  {isBalanceLoading ? 'Loading...' : btcBalance !== null ? `${btcBalance} BTC` : '—'}
                </span>
              </div>
              <Input
                className="focus-visible:ring-yellow-400 focus-visible:border-yellow-400"
                type="number"
                min="0"
                step="0.00000001"
                value={btcAmount}
                onChange={e => setBtcAmount(e.target.value)}
                placeholder="0.00000000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description <span className="text-xs text-muted-foreground">(optional)</span></label>
              <Input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g., Freelance project payment"
              />
            </div>
            <hr className="my-2" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Recipients ({recipients.length})</span>
                <Button variant="ghost" size="sm" onClick={handleAddRecipient} type="button" className="cursor-pointer">
                  + Add recipient
                </Button>
              </div>
              <div className="space-y-4">
                <AnimatePresence>
                  {recipients.map((r, idx) => (
                    <motion.div
                      key={r.id}
                      layout
                      initial={{ opacity: 0, x: 50 }} // swipe in from right
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }} // swipe out to left
                      transition={{ duration: 0.25 }}
                      className="bg-muted rounded-lg p-4 relative"
                    >
                      {recipients.length > 1 && (
                        <button
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer"
                          onClick={() => handleRemoveRecipient(idx)}
                          type="button"
                          aria-label="Remove recipient"
                        >
                          &#128465;
                        </button>
                      )}
                      <div className="mb-2">
                        <label className="text-xs font-medium">Recipient address</label>
                        <Input
                          type="text"
                          value={r.principal}
                          onChange={e => handleRecipientChange(idx, 'principal', e.target.value)}
                          placeholder="Principal address"
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <label className="text-xs font-medium">Percentage (%)</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={r.percentage}
                            onChange={e =>
                              handleRecipientChange(idx, 'percentage', Number(e.target.value))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-medium">Amount</label>
                          <Input
                            type="text"
                            value={
                              btcAmount && r.percentage
                                ? (Number(btcAmount) * r.percentage / 100).toFixed(8)
                                : '0.00000000'
                            }
                            readOnly
                            className="mt-1 bg-gray-900/30"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

              </div>
            </div>
            <Button
              className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold cursor-pointer"
              disabled={isLoading}
              onClick={handleInitiateEscrow}
            >
              {isLoading ? 'Processing...' : 'Initiate escrow'}
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Transaction summary: 20% */}
      <div className="w-[20%] min-w-[220px]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Transaction summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total deposit</span>
              <span>{btcAmount || '0.00000000'} BTC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Recipients</span>
              <span>{recipients.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Status</span>
              <span className="text-yellow-400">Awaiting deposit</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
} 