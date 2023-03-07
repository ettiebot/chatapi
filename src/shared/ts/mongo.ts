import z from 'zod';

export const userSchema = z.object({
  _id: z.string(),
  token: z.string(),
});

export type User = z.infer<typeof userSchema>;
