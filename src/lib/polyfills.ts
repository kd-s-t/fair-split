// Crypto polyfill for Internet Computer SDK
// Provides both crypto and SubtleCrypto implementations

if (typeof window !== 'undefined') {
  // Only add crypto if it doesn't exist
  if (!window.crypto) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto-browserify');
    (window as unknown as { crypto: typeof crypto }).crypto = crypto;
  }
  
  // Ensure SubtleCrypto is available
  if (!window.crypto.subtle) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { subtle } = require('crypto-browserify');
    (window.crypto as unknown as { subtle: typeof subtle }).subtle = subtle;
  }
  
  // Also ensure getRandomValues is available
  if (!window.crypto.getRandomValues) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { randomBytes } = require('crypto-browserify');
    (window.crypto as unknown as { getRandomValues: (array: Uint8Array) => Uint8Array }).getRandomValues = (array: Uint8Array) => {
      const bytes = randomBytes(array.length);
      array.set(bytes);
      return array;
    };
  }
}

export {};
