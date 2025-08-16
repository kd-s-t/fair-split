
import { z } from "zod";

// ICP Principal validation function
const isValidICPPrincipal = (principal: string): boolean => {
  // Temporarily simplify validation to debug the issue
  const isValid = principal.trim().length > 0;
  
  // Debug logging
  console.log('ICP Principal validation:', {
    principal,
    trimmedLength: principal.trim().length,
    isValid
  });
  
  return isValid;
};

const recipientSchema = z.object({
    id: z.string(),
    principal: z.string()
      .min(1, "ICP Principal ID is required")
      .refine(isValidICPPrincipal, "Please enter a valid ICP Principal ID"),
    percentage: z.number().min(0, "Percentage must be at least 0").max(100, "Percentage cannot exceed 100")
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
      }, "Total percentage must equal 100%")
  });