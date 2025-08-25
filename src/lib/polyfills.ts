// Crypto polyfill for Internet Computer SDK
// Provides both crypto and SubtleCrypto implementations

if (typeof window !== 'undefined') {
  try {
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

    // Ensure the crypto object is properly structured
    if (window.crypto && !window.crypto.subtle) {
      console.warn('SubtleCrypto not available, attempting to polyfill...');
      // Create a basic SubtleCrypto polyfill
      const subtleCrypto = {
        generateKey: async (algorithm: any, extractable: boolean, keyUsages: string[]) => {
          throw new Error('SubtleCrypto.generateKey not implemented in polyfill');
        },
        sign: async (algorithm: any, key: any, data: BufferSource) => {
          throw new Error('SubtleCrypto.sign not implemented in polyfill');
        },
        verify: async (algorithm: any, key: any, signature: BufferSource, data: BufferSource) => {
          throw new Error('SubtleCrypto.verify not implemented in polyfill');
        },
        importKey: async (format: string, keyData: any, algorithm: any, extractable: boolean, keyUsages: string[]) => {
          throw new Error('SubtleCrypto.importKey not implemented in polyfill');
        },
        exportKey: async (format: string, key: any) => {
          throw new Error('SubtleCrypto.exportKey not implemented in polyfill');
        }
      };
      
      (window.crypto as any).subtle = subtleCrypto;
    }
  } catch (error) {
    console.error('Failed to initialize crypto polyfill:', error);
  }
}

export {};
