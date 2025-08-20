"use client"

import React, { useState } from 'react';
import { Search, RotateCcw, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FilterBarProps {
  onSearchChange?: (value: string) => void;
  onCategoryChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onRefresh?: () => void;
  searchPlaceholder?: string;
  className?: string;
}

export default function FilterBar({
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onRefresh,
  searchPlaceholder = "Search transactions...",
  className = ""
}: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCategoryFilter(value);
    onCategoryChange?.(value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatusFilter(value);
    onStatusChange?.(value);
  };

  const handleRefresh = () => {
    onRefresh?.();
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative flex-1">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className="w-5 h-5 text-[#BCBCBC]" />
        </div>
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10 pr-4 py-2.5 bg-[#222222] border border-[#303434] rounded-[10px] text-white placeholder-[#BCBCBC] focus:outline-none focus:border-[#FEB64D] h-[40px]"
        />
      </div>

      {/* Category Filter */}
      <select
        value={categoryFilter}
        onChange={handleCategoryChange}
        className="px-4 py-2.5 bg-[#09090B] border border-[#303434] rounded-[10px] text-white focus:outline-none focus:border-[#FEB64D] min-w-[156px] h-[40px] text-sm"
      >
        <option value="all">All categories</option>
        <option value="sent">Sent</option>
        <option value="received">Received</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={handleStatusChange}
        className="px-4 py-2.5 bg-[#09090B] border border-[#303434] rounded-[10px] text-white focus:outline-none focus:border-[#FEB64D] min-w-[139px] h-[40px] text-sm"
      >
        <option value="all">All status</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Active</option>
        <option value="released">Released</option>
        <option value="cancelled">Cancelled</option>
        <option value="declined">Declined</option>
      </select>

      {/* Refresh Button */}
      <Button
        variant="outline"
        onClick={handleRefresh}
        className="h-[40px] px-3 border border-[#7A7A7A] rounded-[10px] text-white hover:bg-[#2a2a2a] transition-colors flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="text-sm">Refresh</span>
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  );
}
