import * as z from "zod";

export const createAndJoinSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});
export type CreateAndJoinInputs = z.infer<typeof createAndJoinSchema>;

export const loginAndJoinSchema = z.object({
  password: z.string().min(1, "Password is required"),
});
export type LoginAndJoinInputs = z.infer<typeof loginAndJoinSchema>;
