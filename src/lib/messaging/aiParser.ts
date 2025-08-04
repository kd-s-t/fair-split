export interface EscrowCreateAction {
  type: 'create_escrow';
  amount: string;
  recipients: string[];
}

export interface ApprovalSuggestionAction {
  type: 'approval_suggestion';
}

export type ParsedAction = EscrowCreateAction | ApprovalSuggestionAction | null;

export async function parseUserMessageWithAI(message: string, apiKey?: string): Promise<ParsedAction> {
  try {
    if (!apiKey) {
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

If the user wants APPROVAL SUGGESTIONS (any mention of approving, declining, suggestions, recommendations, or decisions about escrows), respond with JSON:
{
  "action": "approval_suggestion"
}

If the message is just casual conversation, acknowledgments, or doesn't match either action, respond with JSON:
{
  "action": null
}

IMPORTANT: 
- Be very flexible and understand natural language in any format
- Extract ANY amount mentioned (numbers, decimals, fractions)
- Extract ANY recipient IDs mentioned (ICP principals, usernames, addresses)
- Don't require specific keywords or formats
- Understand context and intent, not just exact phrases
- If someone mentions sending money, creating payments, or transferring funds, treat it as escrow creation
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
      } else if (parsed.action === 'approval_suggestion') {
        return {
          type: 'approval_suggestion'
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