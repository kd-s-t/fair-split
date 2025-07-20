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
  const router = useRouter()
  const { principal } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckboxToggle = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const handleSplitBill = async () => {
    console.log("xxx", {
      selectedBiz, selectedEmployees, principal
    })
    if (!selectedBiz || selectedEmployees.length === 0 || !principal) return
    const total = Number(amount)
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

      toast.success('Bill split successfully!')
      console.log('Split result:', result)
    } catch (err: any) {
      toast.error(`Error splitting bill: ${err.message || err}`)
      console.error('Error splitting bill:', err)
    } finally {
      setIsLoading(false)
    }
  }


  const handleLogout = async () => {
    const { AuthClient } = await import('@dfinity/auth-client')
    const client = await AuthClient.create()
    await client.logout()

    router.push('/')
  }


  const selectedBiz = mockBusinesses.find(biz => biz.id === selectedBusiness)

  return (
    <motion.div
      className="p-6 max-w-2xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-end">
        <Button className='cursor-pointer' variant="default" onClick={handleLogout}>
          Logout
        </Button>
      </div>

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
              <div key={emp.id} className="cursor-pointer flex items-center space-x-3">
                <Checkbox
                  id={emp.id}
                  checked={selectedEmployees.includes(emp.id)}
                  onCheckedChange={() => handleCheckboxToggle(emp.id)}
                />
                <label htmlFor={emp.id} className="text-sm">
                  {emp.name}
                </label>
              </div>
            ))}
            <Input
              placeholder="Enter amount to split"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <Button
              disabled={
                isLoading ||
                selectedEmployees.length === 0 ||
                !amount.trim() ||
                Number(amount) <= 0
              }
              className={`cursor-pointer w-full flex items-center justify-center transition-transform duration-200 hover:scale-105 ${selectedEmployees.length === 0 ||
                !amount.trim() ||
                Number(amount) <= 0
                ? 'opacity-50 cursor-not-allowed'
                : ''
                }`}
              onClick={handleSplitBill}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : (
                <>
                  Split pay ₱{amount || '0'} among {selectedEmployees.length} employee
                  {selectedEmployees.length > 1 && 's'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
