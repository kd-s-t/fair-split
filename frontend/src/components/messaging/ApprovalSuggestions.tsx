import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { populateTransactionSuggestions } from '@/lib/messaging/formPopulation';

interface Transaction {
  id: string;
  status: string;
  title: string;
  to: Array<{
    principal: string;
    percentage: string;
    status: unknown;
  }>;
}

interface ApprovalSuggestionsProps {
  transactions: Transaction[];
}

export function ApprovalSuggestions({ transactions }: ApprovalSuggestionsProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{
    transactionId: string;
    suggestion: 'approve' | 'decline' | 'review';
    reason: string;
  }>>([]);

  useEffect(() => {
    console.log('ApprovalSuggestions component mounted');
    
    // Check if we should show suggestions (triggered by chat)
    const shouldShow = sessionStorage.getItem('splitsafe_show_approval_suggestions');
    console.log('Should show suggestions:', shouldShow);
    
    if (shouldShow) {
      sessionStorage.removeItem('splitsafe_show_approval_suggestions');
      console.log('Setting show suggestions to true');
      setShowSuggestions(true);
      generateSuggestions();
    }
    
    // Listen for refresh events from chat
    const handleRefresh = () => {
      console.log('Refresh event received');
      setShowSuggestions(true);
      generateSuggestions();
    };
    
    window.addEventListener('refresh-approval-suggestions', handleRefresh);
    
    return () => {
      window.removeEventListener('refresh-approval-suggestions', handleRefresh);
    };
  }, []);

  const generateSuggestions = () => {
    const newSuggestions = transactions
      .filter(tx => tx.status === 'pending')
      .map(tx => {
        // Check if percentages are equally split
        const percentages = tx.to.map(r => Number(r.percentage));
        const isEquallySplit = percentages.every(p => p === percentages[0]);
        
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

    setSuggestions(newSuggestions);
  };

  if (!showSuggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-[#222] rounded-lg border border-[#333]">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-5 w-5 text-[#FEB64D]" />
        <h3 className="font-semibold text-white">AI Approval Suggestions</h3>
      </div>
      
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div key={suggestion.transactionId} className="flex items-center gap-3 p-3 bg-[#333] rounded">
            {suggestion.suggestion === 'approve' && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {suggestion.suggestion === 'decline' && (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            {suggestion.suggestion === 'review' && (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            
            <div className="flex-1">
              <p className="text-sm text-white">
                <strong>Transaction {suggestion.transactionId}:</strong> {suggestion.reason}
              </p>
            </div>
            
            <Button
              size="sm"
              variant={suggestion.suggestion === 'approve' ? 'default' : 'outline'}
              className="text-xs"
            >
              {suggestion.suggestion === 'approve' ? 'Approve' : 
               suggestion.suggestion === 'decline' ? 'Decline' : 'Review'}
            </Button>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-[#444]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSuggestions(false)}
          className="text-gray-400 hover:text-white"
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
} 