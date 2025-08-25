export interface EscrowCreateAction {
  type: 'create_escrow';
  amount: string;
  recipients: string[];
  originalCurrency?: string; // Track original currency for conversion
  title?: string; // Custom title if provided
  percentages?: number[]; // Percentage distribution for recipients
}

export interface ApprovalSuggestionAction {
  type: 'approval_suggestion';
}

export interface HelpDecideEscrowsAction {
  type: 'help_decide_escrows';
}

export interface BitcoinAddressSetAction {
  type: 'set_bitcoin_address';
  address: string;
}

export interface QueryAction {
  type: 'query';
  query: 'principal' | 'icp_balance' | 'btc_balance' | 'btc_address' | 'sei_address' | 'sei_balance' | 'nickname' | 'all';
}

export interface PositiveAcknowledgmentAction {
  type: 'positive_acknowledgment';
}

export interface NavigationAction {
  type: 'navigate';
  destination: 'dashboard' | 'escrow' | 'transactions' | 'integrations' | 'settings';
}

export type ParsedAction = EscrowCreateAction | ApprovalSuggestionAction | HelpDecideEscrowsAction | BitcoinAddressSetAction | QueryAction | PositiveAcknowledgmentAction | NavigationAction | null;

export async function parseUserMessageWithAI(message: string, apiKey?: string): Promise<ParsedAction> {
  try {
    
    console.log('DEBUG: AI Parser - Message:', message);
    console.log('DEBUG: AI Parser - API Key valid:', !!(apiKey && apiKey.trim() !== '' && apiKey !== 'sk-proj-YOUR_OPENAI_API_KEY_HERE'));
    
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
            content: `You are a smart parser for SplitSafe escrow actions. Analyze user messages and extract structured data like ChatGPT would - be flexible and understand natural language in any format.

IMPORTANT CURRENCY CONVERSION RULES:
- When users mention fiat currency amounts (like $5, €10, £20, etc.), convert them to BTC using these approximate rates:
  * $1 USD ≈ 0.000025 BTC (1 BTC ≈ $40,000)
  * €1 EUR ≈ 0.000027 BTC (1 BTC ≈ €37,000)
  * £1 GBP ≈ 0.000032 BTC (1 BTC ≈ £31,000)
  * ¥1 JPY ≈ 0.00000017 BTC (1 BTC ≈ ¥6,000,000)
- Always convert fiat amounts to BTC before creating escrows
- Include the original currency in your response for reference
- Note: These are approximate rates. The actual conversion will be done using real-time rates in the application.

If the user wants to CREATE an escrow (any mention of sending, transferring, creating, or making payments), respond with JSON:
{
  "action": "create_escrow",
  "amount": "0.000125",
  "recipients": ["id1", "id2", "id3"],
  "originalCurrency": "$5",
  "title": "Custom title if provided",
  "percentages": [50, 30, 20]
}

For percentage-based splits, include the "percentages" field with an array of percentages that sum to 100.

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
For SEI address queries: {"action": "query", "query": "sei_address"}
For SEI balance queries: {"action": "query", "query": "sei_balance"}
For nickname queries: {"action": "query", "query": "nickname"}
For general account info: {"action": "query", "query": "all"}

If the user wants APPROVAL SUGGESTIONS (any mention of approving, declining, suggestions, recommendations, or decisions about escrows), respond with JSON:
{
  "action": "approval_suggestion"
}

If the user wants HELP DECIDING on escrows (any mention of "help me decide", "should I approve", "what should I do", "advice on escrows", "help with decisions"), respond with JSON:
{
  "action": "help_decide_escrows"
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

EXAMPLES:
- "send $5 to user123" → {"action": "create_escrow", "amount": "0.000125", "recipients": ["user123"], "originalCurrency": "$5"}
- "transfer €10 to alice and bob" → {"action": "create_escrow", "amount": "0.00027", "recipients": ["alice", "bob"], "originalCurrency": "€10"}
- "send 0.5 btc to user456" → {"action": "create_escrow", "amount": "0.5", "recipients": ["user456"]}
- "send 1.245 btc to kenan 60% and don 40%" → {"action": "create_escrow", "amount": "1.245", "recipients": ["kenan", "don"], "percentages": [60, 40]}
- "send 0.5 btc to alice 30%, bob 40%, charlie 30%" → {"action": "create_escrow", "amount": "0.5", "recipients": ["alice", "bob", "charlie"], "percentages": [30, 40, 30]}
- "send 1 btc to john 50% and jane 50%" → {"action": "create_escrow", "amount": "1", "recipients": ["john", "jane"], "percentages": [50, 50]}
- "send $1 to user123, title nice" → {"action": "create_escrow", "amount": "0.000025", "recipients": ["user123"], "originalCurrency": "$1", "title": "nice"}
- "send $1 to user123, random title" → {"action": "create_escrow", "amount": "0.000025", "recipients": ["user123"], "originalCurrency": "$1", "title": "Freelance Project Payment"}
- "send $5 to user123, my custom title" → {"action": "create_escrow", "amount": "0.000125", "recipients": ["user123"], "originalCurrency": "$5", "title": "my custom title"}
- "send $5 to these people id1, id2, id3" → {"action": "create_escrow", "amount": "0.000125", "recipients": ["id1", "id2", "id3"], "originalCurrency": "$5"}
- "send $10 to these people: user123, user456" → {"action": "create_escrow", "amount": "0.00025", "recipients": ["user123", "user456"], "originalCurrency": "$10"}
- "send $5 to these people up3zk-t2nfl-ujojs-rvg3p-h pisk-7c666-3ns4x-i6knn- h5cg4-npfb4-gqe, veqll-x 4jo7-uozuj-u34fj-ttgfc-vx ez2-a5r3b-jqttg-dslgb-5fe 7z-3qe" → {"action": "create_escrow", "amount": "0.000125", "recipients": ["up3zk-t2nfl-ujojs-rvg3p-h pisk-7c666-3ns4x-i6knn- h5cg4-npfb4-gqe", "veqll-x 4jo7-uozuj-u34fj-ttgfc-vx ez2-a5r3b-jqttg-dslgb-5fe 7z-3qe"], "originalCurrency": "$5"}
- "pay $20 to john, jane, and mike for dinner" → {"action": "create_escrow", "amount": "0.0005", "recipients": ["john", "jane", "mike"], "originalCurrency": "$20", "title": "dinner"}
- "split $50 between alice, bob, and charlie" → {"action": "create_escrow", "amount": "0.00125", "recipients": ["alice", "bob", "charlie"], "originalCurrency": "$50"}
- "what is my principal?" → {"action": "query", "query": "principal"}
- "what is my principal ID?" → {"action": "query", "query": "principal"}
- "show my ICP balance" → {"action": "query", "query": "icp_balance"}
- "show my BTC balance" → {"action": "query", "query": "btc_balance"}
- "what's my Bitcoin address?" → {"action": "query", "query": "btc_address"}
- "what is my SEI address?" → {"action": "query", "query": "sei_address"}
- "show my SEI balance" → {"action": "query", "query": "sei_balance"}
- "what is my nickname?" → {"action": "query", "query": "nickname"}

IMPORTANT: 
- Be very flexible and understand natural language in any format, just like ChatGPT
- Extract ANY amount mentioned (numbers, decimals, fractions, currency symbols, written numbers like "five dollars")
- Extract ANY recipient IDs mentioned (ICP principals, usernames, addresses, long alphanumeric strings with spaces)
- Extract ANY Bitcoin address mentioned (starts with 1, 3, or bc1)
- Extract ANY title mentioned after "title" keyword, "for" keyword, or at the end of the message (e.g., "title nice" → "nice", "send $1 to user123, random title" → "Freelance Project Payment", "send $5 to user123, my custom title" → "my custom title", "pay $20 for dinner" → "dinner")
- CRITICAL: For percentage-based splits like "send 1.245 btc to kenan 60% and don 40%", correctly identify "kenan" and "don" as the recipient names, not "and" as a recipient
- When you see "to [name] [percentage]% and [name] [percentage]%", the "and" is a conjunction, not a recipient name
- If the user asks for a "random title", generate a professional escrow title like "Freelance Project Payment", "Consulting Services Escrow", "Content Creation Payment", "Software Development Phase 1", "Design Project Milestone", etc.
- IMPORTANT: When you see "random title" in the user's message, replace it with an actual professional title, don't just return "random title" as the title.
- CRITICAL: Always generate a professional title when the user mentions "random title" - choose from: "Freelance Project Payment", "Design Project Milestone", "Consulting Services Escrow", "Content Creation Payment", "Software Development Phase 1", "Marketing Campaign Deposit", "Project Management Fee", "Technical Support Payment", "Creative Services Escrow", "Business Consulting Fee"
- Don't require specific keywords or formats - understand intent
- Handle complex recipient lists with spaces, commas, and various separators
- Understand context and intent, not just exact phrases
- If someone mentions sending money, creating payments, transferring funds, splitting, or paying, treat it as escrow creation
- If someone mentions setting, using, or providing a Bitcoin address, treat it as Bitcoin address setting
- If someone asks about their account, balance, address, or principal, treat it as a query
- If someone asks for advice, suggestions, or help with decisions about escrows, treat it as approval suggestions
- Ignore casual responses like "thanks", "ok", "got it", "cool", etc. - these are just acknowledgments, not requests for action
- For approval suggestions, the user is likely already on the transactions page, so focus on providing advice rather than navigation
- Be smart about parsing - if you see "to these people" followed by a long list, extract each recipient properly
- Handle edge cases like IDs with spaces, multiple commas, and various formatting`
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
      console.warn(`OpenAI API request failed with status ${response.status}. Falling back to local parser.`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log('DEBUG: AI Parser - OpenAI response:', data);
    console.log('DEBUG: AI Parser - Content:', content);

    if (!content) {
      console.warn('No response content received from GPT. Falling back to local parser.');
      return null;
    }

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content);
      
      if (parsed.action === 'create_escrow') {
        return {
          type: 'create_escrow',
          amount: parsed.amount,
          recipients: parsed.recipients || [],
          originalCurrency: parsed.originalCurrency,
          title: parsed.title,
          percentages: parsed.percentages
        };
      } else if (parsed.action === 'set_bitcoin_address') {
        return {
          type: 'set_bitcoin_address',
          address: parsed.address
        };
      } else if (parsed.action === 'approval_suggestion') {
        return {
          type: 'approval_suggestion'
        };
      } else if (parsed.action === 'help_decide_escrows') {
        return {
          type: 'help_decide_escrows'
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
      console.warn('Failed to parse AI response as JSON. Falling back to local parser.');
      console.debug('Raw AI response:', content);
    }

    return null;
  } catch (error) {
    console.warn('Error parsing message with AI. Falling back to local parser.');
    console.debug('Error details:', error);
    return null;
  }
} 