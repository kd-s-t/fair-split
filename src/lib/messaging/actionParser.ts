export interface EscrowCreateAction {
  type: 'create_escrow';
  amount: string;
  recipients: string[];
}

export interface ApprovalSuggestionAction {
  type: 'approval_suggestion';
}

export type ParsedAction = EscrowCreateAction | ApprovalSuggestionAction | null;

export function parseUserMessage(message: string): ParsedAction {
  const lowerMessage = message.toLowerCase();
  
  // Pattern 1: Create escrow with amount and recipients (flexible format)
  const escrowPatterns = [
    // "create me an escrow 1.5 split equally with this id 6plni-kg3vz-j364n-kq4og-knybs-dlcve-foeoj-3dom6-72644-44fmd-bqe, modgw-in3j2-6e4ze-4gcda-sixdn-4wj5m-wezzo-3v5gy-nfsz5-5skqf-yqe"
    /create.*escrow.*?(\d*\.?\d+).*?(?:btc|split).*?(?:id|with).*?([a-zA-Z0-9\-]+(?:\s*,\s*[a-zA-Z0-9\-]+)*)/i,
    
    // "create an escrow with amount of .5 btc for my homework with these id: 12312, dsadsa, asdsad, dsadsa"
    /create.*escrow.*amount.*?(\d*\.?\d+)\s*btc.*?id.*?([a-zA-Z0-9\-]+(?:\s*,\s*[a-zA-Z0-9\-]+)*)/i,
    
    // "create escrow 0.5 btc for recipients: 12312, dsadsa"
    /create.*escrow.*?(\d*\.?\d+).*?(?:btc|for).*?(?:recipients?|id).*?([a-zA-Z0-9\-]+(?:\s*,\s*[a-zA-Z0-9\-]+)*)/i
  ];
  
  for (const pattern of escrowPatterns) {
    const match = message.match(pattern);
    if (match) {
      const amount = match[1];
      const recipientsText = match[2];
      
      // Extract recipient IDs (split by commas, spaces, or other delimiters)
      const recipients = recipientsText
        .split(/[,,\s]+/)
        .map(id => id.trim())
        .filter(id => id.length > 0);
      
      return {
        type: 'create_escrow',
        amount,
        recipients
      };
    }
  }
  
  // Pattern 2: Approval suggestions for received escrows
  const approvalPattern = /(suggest|approve|decline|recommend).*(escrow|transaction)/i;
  if (approvalPattern.test(lowerMessage)) {
    return {
      type: 'approval_suggestion'
    };
  }
  
  return null;
}

export function generateActionResponse(action: ParsedAction): string {
  if (!action) {
    return "I can only help with two specific actions:\n\n1. **Create Escrow**: Try saying:\n   - 'send 2 btc to [recipient-id]'\n   - 'create escrow 1.5 btc for [recipient-ids]'\n   - 'transfer 0.5 btc to [recipient]'\n\n2. **Approval Suggestions**: Try saying:\n   - 'suggest approvals for my escrows'\n   - 'should I approve or decline?'\n   - 'give me approval recommendations'\n\nPlease rephrase your request using one of these formats.";
  }
  
  switch (action.type) {
    case 'create_escrow':
      const recipientCount = action.recipients.length;
      const recipientText = recipientCount === 1 ? 'recipient' : 'recipients';
      return `I'll help you create an escrow for ${action.amount} BTC with ${recipientCount} ${recipientText}. Redirecting you to the escrow creation form...`;
    
    case 'approval_suggestion':
      return `I'll analyze your received escrows and provide approval recommendations. Showing suggestions in 2 seconds...`;
    
    default:
      return "I'm sorry, but I can only handle escrow creation and approval suggestions.";
  }
} 