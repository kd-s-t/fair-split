/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { createSplitDappActor } from '@/lib/icp/splitDapp'
import { Principal } from '@dfinity/principal'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

const mockBusinesses = [
  {
    id: 'biz-1',
    name: 'Yumi Cafe',
    employees: [
      { id: '2vxsx-fae', name: 'Alice' },
      { id: 'qaa6y-5yaaa-aaaaa-aaafa-cai', name: 'Bob' },
      { id: 'aaaaa-aa', name: 'Charlie' },
    ],
  },
  {
    id: 'biz-2',
    name: 'Sundae Prints',
    employees: [
      { id: 'aaaaa-aa', name: 'Daisy' },
      { id: 'qaa6y-5yaaa-aaaaa-aaafa-cai', name: 'Ethan' },
    ],
  },
]

export default function DashboardPage() {
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [amount, setAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const { principal } = useAuth()

  const selectedBiz = mockBusinesses.find(biz => biz.id === selectedBusiness)

  const handleCheckboxToggle = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const handleSplitBill = async () => {
    if (!selectedBiz || selectedEmployees.length === 0 || !principal) {
      toast.error('Please select a business and at least one employee.')
      return
    }

    const total = Number(amount)
    if (isNaN(total) || total <= 0) {
      toast.error('Invalid amount')
      return
    }

    setIsLoading(true)

    try {
      const actor = await createSplitDappActor()
      const result = await actor.splitBill(
        {
          participants: selectedEmployees.map(id => Principal.fromText(id)),
          total,
        },
        principal
      )
      toast.success('Bill split successfully!', {
        description: 'The amount was successfully distributed to selected employees.',
        action: {
          label: 'Dismiss',
          onClick: () => console.log('Toast dismissed'),
        },
      })
      console.log('Split result:', result)
    } catch (err: any) {
      toast.error(`Error splitting bill: ${err.message || err}`)
      console.error('Error splitting bill:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="p-6 max-w-2xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Select Business</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {mockBusinesses.map(biz => (
            <Button
              key={biz.id}
              variant="outline"
              className={`cursor-pointer w-full justify-start border-2 ${selectedBusiness === biz.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300'
                }`}
              onClick={() => {
                setSelectedBusiness(biz.id)
                setSelectedEmployees([])
              }}
            >
              {biz.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      {selectedBiz && (
        <Card>
          <CardHeader>
            <CardTitle>Employees of {selectedBiz.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedBiz.employees.map(emp => (
              <div key={emp.id} className="flex items-center space-x-3">
                <Checkbox
                  id={emp.id}
                  className='cursor-pointer'
                  checked={selectedEmployees.includes(emp.id)}
                  onCheckedChange={() => handleCheckboxToggle(emp.id)}
                />
                <label htmlFor={emp.id} className="cursor-pointer text-sm">
                  {emp.name}
                </label>
              </div>
            ))}

            <Input
              placeholder="cursor-pointer Enter amount to split"
              type="number"
              value={amount}
              min={1}
              step="0.01"
              onChange={e => setAmount(e.target.value)}
            />

            <Button
              disabled={isLoading}
              onClick={handleSplitBill}
              className="cursor-pointer w-full flex items-center justify-center"
            >
              {isLoading ? 'Splitting...' : `Split pay ₱${amount || '0'} among ${selectedEmployees.length} employee${selectedEmployees.length > 1 ? 's' : ''}`}
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
