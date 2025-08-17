import z from "zod";

export const withdrawFormSchema = z.object({
    amount: z.string(),
    address: z.string(),
  });