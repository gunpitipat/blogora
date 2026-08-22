import * as z from 'zod';

export const signupSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Email is required.')
      .pipe(z.email({ error: 'Enter a valid email address.' })),
    username: z
      .string()
      .trim()
      .min(5, 'Username must have at least 5 characters.')
      .max(20, 'Username cannot be longer than 20 characters.')
      .regex(/^\S+$/, 'Username cannot contain spaces.'),
    password: z
      .string()
      // Do not silently trim user's password.
      .min(8, 'Password must have at least 8 characters.')
      .regex(/^\S+$/, 'Password cannot contain spaces.'),
    confirmPassword: z.string().min(1, 'Confirm password is required.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
  // Match the backend's legacy request field name.
  .transform(({ confirmPassword, ...credentials }) => ({
    ...credentials,
    cfpassword: confirmPassword,
  }));

export type SignupFormInput = z.input<typeof signupSchema>;
export type SignupCredentials = z.output<typeof signupSchema>;
export type SignupField = keyof SignupFormInput;
