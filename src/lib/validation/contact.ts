import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.union([z.literal(""), z.string().min(6)]).optional(),
  subject: z.string().min(5),
  message: z.string().min(10),
});
