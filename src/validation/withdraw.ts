import z from "zod";

export const withdrawFormSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number"
    }),
  address: z.string()
    .min(1, "Address is required")
    .min(26, "Address is too short")
    .max(100, "Address is too long"),
  isAcceptedTerms: z.boolean()
    .refine((val) => val === true, {
      message: "You must accept the terms and conditions"
    })
});