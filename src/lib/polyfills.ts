// Polyfills for Internet Identity and crypto functionality
// This ensures SubtleCrypto is available in all environments

if (typeof window !== 'undefined') {
  // Ensure crypto is available globally
  if (!window.crypto) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    (window as unknown as { crypto: unknown }).crypto = require('crypto-browserify');
  }
  
  // Ensure SubtleCrypto is available
  if (!window.crypto.subtle) {
    console.warn('SubtleCrypto not available, using polyfill');
    // Basic polyfill for SubtleCrypto
    (window as unknown as { crypto: { subtle: unknown } }).crypto.subtle = {
      generateKey: async () => {
        throw new Error('SubtleCrypto.generateKey not implemented in polyfill');
      },
      sign: async () => {
        throw new Error('SubtleCrypto.sign not implemented in polyfill');
      },
      verify: async () => {
        throw new Error('SubtleCrypto.verify not implemented in polyfill');
      },
      importKey: async () => {
        throw new Error('SubtleCrypto.importKey not implemented in polyfill');
      },
      exportKey: async () => {
        throw new Error('SubtleCrypto.exportKey not implemented in polyfill');
      },
      digest: async () => {
        throw new Error('SubtleCrypto.digest not implemented in polyfill');
      }
    };
  }
}

export {};
