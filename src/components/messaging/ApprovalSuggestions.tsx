"use client"

import { useEffect } from 'react';
import type { NormalizedTransaction } from "@/modules/transactions/types";

interface ApprovalSuggestionsProps {
  transactions: NormalizedTransaction[];
}

export function ApprovalSuggestions({ transactions }: ApprovalSuggestionsProps) {
  useEffect(() => {
    console.log('ApprovalSuggestions component mounted');
    console.log('Initial transactions received:', transactions);
    
    const generateSuggestions = () => {
      console.log('Generating suggestions for transactions:', transactions);
      console.log('Transactions length:', transactions.length);
      console.log('Transaction statuses:', transactions.map(tx => ({ id: tx.id, status: tx.status })));
      
      const pendingTransactions = transactions.filter(tx => tx.status === 'pending');
      console.log('Pending transactions:', pendingTransactions);
      
      const newSuggestions = pendingTransactions.map(tx => {
        // Check if percentages are equally split
        const percentages = tx.to.map(r => Number(r.percentage));
        const isEquallySplit = percentages.every(p => p === percentages[0]);
        
        console.log(`Transaction ${tx.id}: percentages=${percentages}, isEquallySplit=${isEquallySplit}`);
        
        if (isEquallySplit) {
          return {
            transactionId: tx.id,
            suggestion: 'approve' as const,
            reason: 'Equal split detected - safe to approve'
          };
        } else {
          return {
            transactionId: tx.id,
            suggestion: 'review' as const,
            reason: 'Uneven split - review carefully'
          };
        }
      });

      console.log('Generated suggestions:', newSuggestions);
    };
    
    // Check if we should show suggestions (triggered by chat)
    const shouldShow = sessionStorage.getItem('splitsafe_show_approval_suggestions');
    console.log('Should show suggestions:', shouldShow);
    
    if (shouldShow) {
      sessionStorage.removeItem('splitsafe_show_approval_suggestions');
      console.log('Setting show suggestions to true');
      generateSuggestions();
    }
    
    // Listen for refresh events from chat
    const handleRefresh = () => {
      console.log('Refresh event received');
      generateSuggestions();
    };
    
    window.addEventListener('refresh-approval-suggestions', handleRefresh);
    
    return () => {
      window.removeEventListener('refresh-approval-suggestions', handleRefresh);
    };
  }, [transactions]);

  // Don't render anything - we'll handle suggestions inline in the transaction rows
  return null;
} 