// Crypto polyfill for Internet Computer SDK
// Provides both crypto and SubtleCrypto implementations

if (typeof window !== 'undefined') {
  // Only add crypto if it doesn't exist
  if (!window.crypto) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto-browserify');
    (window as any).crypto = crypto;
  }
  
  // Ensure SubtleCrypto is available
  if (!window.crypto.subtle) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { subtle } = require('crypto-browserify');
    (window.crypto as any).subtle = subtle;
  }
  
  // Also ensure getRandomValues is available
  if (!window.crypto.getRandomValues) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { randomBytes } = require('crypto-browserify');
    (window.crypto as any).getRandomValues = (array: Uint8Array) => {
      const bytes = randomBytes(array.length);
      array.set(bytes);
      return array;
    };
  }
}

export {};
