// Minimal crypto polyfill for Internet Identity
// Only provide basic crypto if not available, don't override SubtleCrypto

if (typeof window !== 'undefined') {
  // Only add crypto if it doesn't exist
  if (!window.crypto) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    (window as unknown as { crypto: unknown }).crypto = require('crypto-browserify');
  }
  
  // Don't override SubtleCrypto - let browser handle it
  // This prevents the "not implemented" errors
}

export {};
