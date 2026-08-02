import * as z from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export type LoginFormInput = z.input<typeof loginSchema>;
export type LoginCredentials = z.output<typeof loginSchema>;
