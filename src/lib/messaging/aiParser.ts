export interface EscrowCreateAction {
  type: 'create_escrow';
  amount: string;
  recipients: string[];
}

export interface ApprovalSuggestionAction {
  type: 'approval_suggestion';
}

export interface BitcoinAddressSetAction {
  type: 'set_bitcoin_address';
  address: string;
}

export interface QueryAction {
  type: 'query';
  query: 'principal' | 'icp_balance' | 'btc_balance' | 'btc_address' | 'all';
}

export interface PositiveAcknowledgmentAction {
  type: 'positive_acknowledgment';
}

export interface NavigationAction {
  type: 'navigate';
  destination: 'dashboard' | 'escrow' | 'transactions' | 'integrations' | 'settings';
}

export type ParsedAction = EscrowCreateAction | ApprovalSuggestionAction | BitcoinAddressSetAction | QueryAction | PositiveAcknowledgmentAction | NavigationAction | null;

export async function parseUserMessageWithAI(message: string, apiKey?: string): Promise<ParsedAction> {
  try {
    console.log('🔍 AI Parser Debug: API Key received:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'sk-proj-YOUR_OPENAI_API_KEY_HERE') {
      console.warn('OpenAI API key is missing or invalid');
      return null;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a parser for SplitSafe escrow actions. Analyze user messages and extract structured data.

If the user wants to CREATE an escrow (any mention of sending, transferring, creating, or making payments), respond with JSON:
{
  "action": "create_escrow",
  "amount": "0.5",
  "recipients": ["id1", "id2", "id3"]
}

If the user wants to SET their Bitcoin address (any mention of setting, using, or providing a Bitcoin address), respond with JSON:
{
  "action": "set_bitcoin_address",
  "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
}

If the user wants to QUERY their account information, respond with JSON based on what they're asking for:

For principal/identity queries: {"action": "query", "query": "principal"}
For ICP balance queries: {"action": "query", "query": "icp_balance"}
For Bitcoin balance queries: {"action": "query", "query": "btc_balance"}
For Bitcoin address queries: {"action": "query", "query": "btc_address"}
For general account info: {"action": "query", "query": "all"}

If the user wants APPROVAL SUGGESTIONS (any mention of approving, declining, suggestions, recommendations, or decisions about escrows), respond with JSON:
{
  "action": "approval_suggestion"
}

If the user wants POSITIVE ACKNOWLEDGMENTS (any mention of "thanks", "ok", "got it", "cool", "nice", "great", "awesome", "perfect", "sweet", "excellent", "brilliant", "sounds good", "looks good", "that works", "yeah", "yes", "yep", "yup", "👍", "✅", "🎉", "😊", "😄", "😎"), respond with JSON:
{
  "action": "positive_acknowledgment"
}

If the user wants to NAVIGATE to different pages (any mention of "go to dashboard", "show transactions", "open escrow", "navigate to settings", etc.), respond with JSON:
{
  "action": "navigate",
  "destination": "dashboard|escrow|transactions|integrations|settings"
}

If the message is just casual conversation, acknowledgments, or doesn't match any action, respond with JSON:
{
  "action": null
}

IMPORTANT: 
- Be very flexible and understand natural language in any format
- Extract ANY amount mentioned (numbers, decimals, fractions)
- Extract ANY recipient IDs mentioned (ICP principals, usernames, addresses)
- Extract ANY Bitcoin address mentioned (starts with 1, 3, or bc1)
- Don't require specific keywords or formats
- Understand context and intent, not just exact phrases
- If someone mentions sending money, creating payments, or transferring funds, treat it as escrow creation
- If someone mentions setting, using, or providing a Bitcoin address, treat it as Bitcoin address setting
- If someone asks about their account, balance, address, or principal, treat it as a query
- If someone asks for advice, suggestions, or help with decisions about escrows, treat it as approval suggestions
- Ignore casual responses like "thanks", "ok", "got it", "cool", etc. - these are just acknowledgments, not requests for action
- For approval suggestions, the user is likely already on the transactions page, so focus on providing advice rather than navigation`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 200,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content received from GPT');
    }

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content);
      console.log('AI Parser Response:', parsed);
      
      if (parsed.action === 'create_escrow') {
        console.log('Creating escrow with:', { amount: parsed.amount, recipients: parsed.recipients });
        return {
          type: 'create_escrow',
          amount: parsed.amount,
          recipients: parsed.recipients || []
        };
      } else if (parsed.action === 'set_bitcoin_address') {
        console.log('Setting Bitcoin address:', parsed.address);
        return {
          type: 'set_bitcoin_address',
          address: parsed.address
        };
      } else if (parsed.action === 'approval_suggestion') {
        return {
          type: 'approval_suggestion'
        };
      } else if (parsed.action === 'query') {
        return {
          type: 'query',
          query: parsed.query
        };
      } else if (parsed.action === 'positive_acknowledgment') {
        return {
          type: 'positive_acknowledgment'
        };
      } else if (parsed.action === 'navigate') {
        return {
          type: 'navigate',
          destination: parsed.destination
        };
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw AI response:', content);
    }

    return null;
  } catch (error) {
    console.error('Error parsing message with AI:', error);
    return null;
  }
} 