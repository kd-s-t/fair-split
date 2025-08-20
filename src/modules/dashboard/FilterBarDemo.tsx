"use client"

import React, { useState, useMemo } from 'react';
import FilterBar from './FilterBar';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';

// Mock data for demonstration
const mockTransactions = [
  { id: 1, title: 'Invoice #001', category: 'sent', status: 'pending', amount: '0.001 ckBTC' },
  { id: 2, title: 'Payment #002', category: 'received', status: 'confirmed', amount: '0.002 ckBTC' },
  { id: 3, title: 'Escrow #003', category: 'sent', status: 'released', amount: '0.003 ckBTC' },
  { id: 4, title: 'Transfer #004', category: 'received', status: 'cancelled', amount: '0.004 ckBTC' },
  { id: 5, title: 'Payment #005', category: 'sent', status: 'declined', amount: '0.005 ckBTC' },
];

export default function FilterBarDemo() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(transaction => {
      const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, categoryFilter, statusFilter]);

  const handleRefresh = () => {
    // Simulate refresh
    console.log('Refreshing data...');
    // In a real app, this would fetch fresh data
  };

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h2" className="mb-4">Filter Bar Demo</Typography>
        <Typography variant="muted" className="mb-6">
          This demonstrates the FilterBar component with search and filtering functionality.
        </Typography>
      </div>

      <FilterBar
        onSearchChange={setSearchTerm}
        onCategoryChange={setCategoryFilter}
        onStatusChange={setStatusFilter}
        onRefresh={handleRefresh}
        searchPlaceholder="Search transactions..."
      />

      <div className="space-y-4">
        <Typography variant="h3">Filtered Results ({filteredTransactions.length})</Typography>
        
        {filteredTransactions.length === 0 ? (
          <Card className="p-6 text-center">
            <Typography variant="muted">No transactions match your filters.</Typography>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTransactions.map(transaction => (
              <Card key={transaction.id} className="p-4 bg-[#222222] border-[#303434]">
                <div className="flex justify-between items-center">
                  <div>
                    <Typography variant="h4" className="text-white">{transaction.title}</Typography>
                    <div className="flex gap-4 mt-2">
                      <span className="text-sm text-[#BCBCBC] capitalize">{transaction.category}</span>
                      <span className="text-sm text-[#BCBCBC] capitalize">{transaction.status}</span>
                    </div>
                  </div>
                  <Typography variant="h4" className="text-[#FEB64D]">{transaction.amount}</Typography>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-[#1a1a1a] rounded-lg">
        <Typography variant="h4" className="mb-2">Current Filters:</Typography>
        <div className="space-y-1 text-sm text-[#BCBCBC]">
          <div>Search: &quot;{searchTerm || 'None'}&quot;</div>
          <div>Category: {categoryFilter}</div>
          <div>Status: {statusFilter}</div>
        </div>
      </div>
    </div>
  );
}
