
import { z } from "zod";

// Define the form data type explicitly
export interface EscrowFormData {
  title: string;
  btcAmount: string;
  recipients: Array<{
    id: string;
    name: string;
    principal: string;
    percentage: number;
  }>;
  useSeiAcceleration: boolean;
}

// Enhanced ICP Principal validation function
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

const recipientSchema = z.object({
    id: z.string(),
    name: z.string(),
    principal: z.string()
      .min(1, "ICP Principal ID is required")
      .refine((val) => validateAddressType(val, 'ICP'), "Please enter a valid ICP Principal ID (not a Bitcoin address)"),
    percentage: z.coerce.number().min(0, "Percentage must be at least 0").max(100, "Percentage cannot exceed 100")
  });


const btcAmountSchema = z
  .string()
  .refine((val) => val.trim() !== "", { message: "Please enter an amount to continue." })
  .refine((val) => !isNaN(Number(val)), { message: "Amount must be a number" })
  .refine(
    (val) => {
      const trimmed = val.trim();
      if (/^0+(\.0+)?$/.test(trimmed)) {
        return false;
      }
      return Number(trimmed) > 0;
    },
    { message: "Amount must be greater than zero." }
  )
  .refine((val) => Number(val) <= 10, { message: "Escrow amount exceeds the maximum allowed. Please lower the amount." })
  .refine(
    (val) => {
      const [, decimals] = val.split(".");
      if (!decimals) return true;
      const trimmedDecimals = decimals.replace(/0+$/, "");
      return trimmedDecimals.length <= 8;
    },
    { message: "Bitcoin supports up to 8 decimal places only." }
  )
  

export const escrowFormSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
    btcAmount: btcAmountSchema,
    recipients: z.array(recipientSchema)
      .min(1, "At least one recipient is required")
      .refine((recipients) => {
        const totalPercentage = recipients.reduce((sum, recipient) => sum + recipient.percentage, 0);
        return Math.abs(totalPercentage - 100) < 0.01; // Allow for small floating point errors
      }, "Total percentage must equal 100%"),
    useSeiAcceleration: z.boolean().default(true)
  });