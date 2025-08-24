// Test file to demonstrate address validation functionality
import { isValidICPPrincipal, isValidBitcoinAddress, validateAddressType, getAddressType } from './utils';

// Test cases for validation
export const testAddressValidation = () => {
  console.log('=== Address Validation Tests ===');
  
  // Valid ICP Principals
  const validICPs = [
    'ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe',
    'aaaaa-aa',
    '2vxsx-fae' // Anonymous principal (should be invalid)
  ];
  
  // Valid Bitcoin Addresses
  const validBTCs = [
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
    'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
  ];
  
  // Invalid addresses (wrong type in wrong field)
  const invalidMixes = [
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // BTC address in ICP field
    'ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe' // ICP principal in BTC field
  ];
  
  console.log('\n--- ICP Principal Validation ---');
  validICPs.forEach(principal => {
    const isValid = isValidICPPrincipal(principal);
    const addressType = getAddressType(principal);
    console.log(`${principal}: ${isValid ? '✅ Valid' : '❌ Invalid'} (Type: ${addressType})`);
  });
  
  console.log('\n--- Bitcoin Address Validation ---');
  validBTCs.forEach(address => {
    const isValid = isValidBitcoinAddress(address);
    const addressType = getAddressType(address);
    console.log(`${address}: ${isValid ? '✅ Valid' : '❌ Invalid'} (Type: ${addressType})`);
  });
  
  console.log('\n--- Cross-Validation Tests ---');
  console.log('BTC address in ICP field:');
  console.log(`1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa in ICP field: ${validateAddressType('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'ICP') ? '❌ Should be invalid' : '✅ Correctly invalid'}`);
  
  console.log('ICP principal in BTC field:');
  console.log(`ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe in BTC field: ${validateAddressType('ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe', 'BTC') ? '❌ Should be invalid' : '✅ Correctly invalid'}`);
  
  console.log('\n--- Address Type Detection ---');
  const testAddresses = [
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    'ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe',
    'invalid-address',
    'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
  ];
  
  testAddresses.forEach(address => {
    const type = getAddressType(address);
    console.log(`${address}: ${type}`);
  });
};

// Example usage in forms:
export const getValidationMessage = (address: string, expectedType: 'ICP' | 'BTC'): string => {
  if (expectedType === 'ICP') {
    if (address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1')) {
      return "❌ This looks like a Bitcoin address. Please enter an ICP Principal ID instead.";
    }
    if (!isValidICPPrincipal(address)) {
      return "❌ Please enter a valid ICP Principal ID (format: xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxx)";
    }
  } else if (expectedType === 'BTC') {
    if (address.includes('-') && address.length > 20) {
      return "❌ This looks like an ICP Principal ID. Please enter a Bitcoin address instead.";
    }
    if (!isValidBitcoinAddress(address)) {
      return "❌ Please enter a valid Bitcoin address (should start with 1, 3, or bc1)";
    }
  }
  
  return "✅ Valid address";
};
