export function cn(...inputs: string[]) {
  return inputs.filter(Boolean).join(' ')
}
export function truncatePrincipal(principalId: string) {
  return principalId.slice(0, 5) + '...' + principalId.slice(-4);
}
export function getAvatarUrl(seed?: string) {
  const avatarSeed = seed || 'default';
  
  // Generate a deterministic color based on the seed
  const colors = ['6366f1', '8b5cf6', 'a855f7', 'c084fc', 'd8b4fe'];
  const hash = avatarSeed.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const colorIndex = Math.abs(hash) % colors.length;
  const color = colors[colorIndex];
  
  // Generate a simple SVG avatar locally
  const svg = `
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="#${color}" opacity="0.1"/>
      <circle cx="60" cy="40" r="20" fill="#${color}"/>
      <path d="M20 100 Q60 80 100 100" stroke="#${color}" stroke-width="3" fill="none"/>
      <text x="60" y="110" text-anchor="middle" font-family="Arial" font-size="8" fill="#${color}">
        ${avatarSeed.slice(0, 3).toUpperCase()}
      </text>
    </svg>
  `;
  
  // Convert SVG to data URL
  const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
  return dataUrl;
}

// Real-time Bitcoin price fetching with CoinGecko API
let cachedBtcPrice: number | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getBitcoinPrice(): Promise<number> {
  const now = Date.now();
  
  // Return cached price if still valid
  if (cachedBtcPrice && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedBtcPrice;
  }

  try {
    // Use CoinGecko API (free, no API key required)
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const data = await response.json();
    
    if (data.bitcoin && data.bitcoin.usd) {
      cachedBtcPrice = data.bitcoin.usd;
      lastFetchTime = now;
      return cachedBtcPrice;
    }
  } catch (error) {
    console.warn('CoinGecko API failed:', error);
  }

  // Return cached price or fallback to current market rate
  if (cachedBtcPrice !== null) {
    return cachedBtcPrice;
  }
  return 114764.80; // Current approximate rate as fallback
}

// Convert BTC to USD using real-time rates
export async function btcToUsd(btcAmount: number): Promise<number> {
  const btcPrice = await getBitcoinPrice();
  return btcAmount * btcPrice;
}

// Convert USD to BTC using real-time rates
export async function usdToBtc(usdAmount: number): Promise<number> {
  const btcPrice = await getBitcoinPrice();
  return usdAmount / btcPrice;
}

// Convert ckBTC to USD (ckBTC is 1:1 with BTC)
export async function ckBtcToUsd(ckbtcAmount: number): Promise<number> {
  return await btcToUsd(ckbtcAmount);
}

export const truncateAddress = (addr: string) => {
  if (addr.length <= 12) return addr;
  return addr.slice(0, 7) + '...' + addr.slice(-5);
}

/**
 * Formats satoshis to BTC with 8 decimal places
 * @param satoshis - Amount in satoshis (number or string)
 * @returns Formatted BTC amount as string
 */
export const formatBTC = (satoshis: number | string): string => {
  const satoshisNum = typeof satoshis === 'string' ? Number(satoshis) : satoshis;
  return (satoshisNum / 1e8).toFixed(8);
};

/**
 * Converts fiat currency amounts to BTC using real-time rates
 * @param amount - Amount in fiat currency
 * @param currency - Currency code or symbol
 * @returns Promise<BTC amount as string with 8 decimal places>
 */
export const convertCurrencyToBTC = async (amount: number, currency: string): Promise<string> => {
  // For USD, use real-time rate
  if (currency === '$' || currency === 'USD') {
    const btcAmount = await usdToBtc(amount);
    return btcAmount.toFixed(8);
  }

  // For other currencies, use approximate rates (these could also be made real-time)
  const conversionRates: { [key: string]: number } = {
    '€': 0.0000087, // €1 EUR ≈ 0.0000087 BTC (1 BTC ≈ €114,764)
    '£': 0.0000074, // £1 GBP ≈ 0.0000074 BTC (1 BTC ≈ £135,000)
    '¥': 0.000000078, // ¥1 JPY ≈ 0.000000078 BTC (1 BTC ≈ ¥12,800,000)
    'EUR': 0.0000087,
    'GBP': 0.0000074,
    'JPY': 0.000000078,
    'CAD': 0.0000067, // Canadian Dollar
    'AUD': 0.0000061, // Australian Dollar
    'CHF': 0.0000095, // Swiss Franc
  };

  const rate = conversionRates[currency] || conversionRates['$']; // Default to USD
  const btcAmount = amount * rate;
  
  return btcAmount.toFixed(8); // Return with 8 decimal places
};

/**
 * Detects currency amounts in text and returns conversion info
 * @param text - Text to search for currency amounts
 * @returns Currency info or null if not found
 */
export const detectCurrencyAmount = (text: string): { amount: string; currency: string; originalText: string } | null => {
  // Patterns for different currencies
  const currencyPatterns = [
    /\$(\d+(?:\.\d{1,2})?)/i, // $5, $5.50, $5.99
    /€(\d+(?:\.\d{1,2})?)/i, // €10, €10.50
    /£(\d+(?:\.\d{1,2})?)/i, // £20, £20.50
    /¥(\d+(?:\.\d{1,2})?)/i, // ¥1000, ¥1000.50
    /(\d+(?:\.\d{1,2})?)\s*(USD|EUR|GBP|JPY|CAD|AUD|CHF)/i, // 5 USD, 10 EUR
  ];

  for (const pattern of currencyPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = match[1];
      let currency = match[2] || match[0].charAt(0); // Use symbol if no currency code
      
      // Normalize currency symbols
      if (currency === '$') currency = 'USD';
      if (currency === '€') currency = 'EUR';
      if (currency === '£') currency = 'GBP';
      if (currency === '¥') currency = 'JPY';
      
      return {
        amount,
        currency,
        originalText: match[0]
      };
    }
  }
  
  return null;
};

// Generate a random transaction hash for display
export const generateRandomHash = (): string => {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

interface TransactionRecipient {
  principal: string;
  amount: string | number;
}

interface Transaction {
  from: string;
  to: TransactionRecipient[];
  createdAt?: string | number;
}

export async function generateTransactionMessage(
  transaction: Transaction,
  currentUserId: string,
  includeDate: boolean = true
): Promise<string> {
  const isSender = String(transaction.from) === String(currentUserId);
  const isRecipient = transaction.to?.some((recipient: TransactionRecipient) => 
    String(recipient.principal) === String(currentUserId)
  );

  const totalAmount = transaction.to?.reduce((sum: number, recipient: TransactionRecipient) => 
    sum + (recipient.amount ? Number(recipient.amount) : 0), 0
  ) || 0;

  const btcAmount = totalAmount / 1e8;
  const usdAmount = await btcToUsd(btcAmount);

  let message = '';

  if (isSender) {
    message = `You sent ${btcAmount.toFixed(6)} BTC ($${usdAmount.toFixed(2)})`;
  } else if (isRecipient) {
    message = `You received ${btcAmount.toFixed(6)} BTC ($${usdAmount.toFixed(2)})`;
  } else {
    message = `Transaction: ${btcAmount.toFixed(6)} BTC ($${usdAmount.toFixed(2)})`;
  }

  if (includeDate && transaction.createdAt) {
    const date = new Date(Number(transaction.createdAt) / 1_000_000);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    message += ` on ${dateStr} at ${timeStr}`;
  }

  return message;
}
