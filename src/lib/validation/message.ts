import { z } from "zod";

export const updateMessageSchema = z.object({
  isRead: z.boolean(),
});
