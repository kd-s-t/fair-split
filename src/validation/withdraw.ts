import z from "zod";

// ICP Principal validation function
const isValidICPPrincipal = (principal: string): boolean => {
  const trimmed = principal.trim();
  
  // Check if empty
  if (trimmed.length === 0) {
    return false;
  }
  
  // ICP Principal format: alphanumeric characters with hyphens, typically 27-63 characters
  // Format: xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxx
  const icpPrincipalRegex = /^[a-zA-Z0-9\-]{27,63}$/;
  
  // Check if it matches the ICP principal format
  if (!icpPrincipalRegex.test(trimmed)) {
    return false;
  }
  
  // Check if it's not the anonymous principal
  if (trimmed === "2vxsx-fae") {
    return false;
  }
  
  // Check if it has the correct number of segments (should be 11 segments separated by hyphens)
  const segments = trimmed.split('-');
  if (segments.length !== 11) {
    return false;
  }
  
  // Each segment should be 5 characters (except possibly the last one)
  for (let i = 0; i < segments.length - 1; i++) {
    if (segments[i].length !== 5) {
      return false;
    }
  }
  
  // Last segment should be 3 characters
  if (segments[segments.length - 1].length !== 3) {
    return false;
  }
  
  return true;
};

// Bitcoin address validation function
const isValidBitcoinAddress = (address: string): boolean => {
  const trimmed = address.trim();
  
  // Check if empty
  if (trimmed.length === 0) {
    return false;
  }
  
  // Bitcoin address length validation (26-90 characters)
  if (trimmed.length < 26 || trimmed.length > 90) {
    return false;
  }
  
  // Bitcoin address format validation
  // Legacy addresses start with 1
  // P2SH addresses start with 3
  // Bech32 addresses start with bc1
  const bitcoinAddressRegex = /^(1|3|bc1)[a-zA-Z0-9]+$/;
  
  if (!bitcoinAddressRegex.test(trimmed)) {
    return false;
  }
  
  // Additional validation for bc1 addresses (should be longer)
  if (trimmed.startsWith('bc1')) {
    if (trimmed.length < 42 || trimmed.length > 90) {
      return false;
    }
  }
  
  return true;
};

// Enhanced validation to detect wrong address types
const validateAddressType = (address: string, expectedType: 'ICP' | 'BTC'): boolean => {
  const trimmed = address.trim();
  
  if (expectedType === 'ICP') {
    // If someone enters a BTC address in ICP field, it should be invalid
    if (trimmed.startsWith('1') || trimmed.startsWith('3') || trimmed.startsWith('bc1')) {
      return false;
    }
    return isValidICPPrincipal(trimmed);
  } else if (expectedType === 'BTC') {
    // If someone enters an ICP principal in BTC field, it should be invalid
    if (trimmed.includes('-') && trimmed.length > 20) {
      return false;
    }
    return isValidBitcoinAddress(trimmed);
  }
  
  return false;
};

export const withdrawFormSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number"
    }),
  address: z.string()
    .min(1, "Address is required")
    .min(26, "Address is too short")
    .max(100, "Address is too long")
    .refine((val) => {
      // This will be refined further based on the selected currency
      return true;
    }, "Please enter a valid address"),
  isAcceptedTerms: z.boolean()
    .refine((val) => val === true, {
      message: "You must accept the terms and conditions"
    })
});

// Dynamic validation based on selected currency
export const createWithdrawSchema = (selectedCurrency: 'ICP' | 'BTC') => {
  return z.object({
    amount: z.string()
      .min(1, "Amount is required")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number"
      }),
      address: z.string()
    .min(1, "Address is required")
    .refine((address) => validateAddressType(address, selectedCurrency), {
      message: selectedCurrency === 'ICP'
        ? "Please enter a valid ICP Principal ID (not a Bitcoin address)"
        : "Please enter a valid Bitcoin address (not an ICP Principal ID)"
    }),
    isAcceptedTerms: z.boolean()
      .refine((val) => val === true, {
        message: "You must accept the terms and conditions"
      })
  });
};