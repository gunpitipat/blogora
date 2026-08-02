import * as z from 'zod';
import { API_BASE_URL } from '@/config/env';
import type { LoginCredentials } from '@/features/auth/schemas/login.schema';

const loginFieldSchema = z.enum(['username', 'password']);

const loginResponseSchema = z.object({
  message: z.string().min(1),
  username: z.string().min(1),
});

const loginErrorResponseSchema = z.object({
  message: z.string().min(1),
  field: loginFieldSchema.optional(),
});

export type LoginField = z.infer<typeof loginFieldSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export class LoginError extends Error {
  readonly field: LoginField | undefined;
  readonly status: number | undefined;

  constructor(message: string, status?: number, field?: LoginField) {
    super(message);
    this.name = 'LoginError';
    this.status = status;
    this.field = field;
  }
}

export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new LoginError('Network error. Please try again.');
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = loginErrorResponseSchema.safeParse(body);

    const fallbackMessage =
      response.status >= 500
        ? 'Server error. Please try again later.'
        : 'Something went wrong. Please try again.';

    const message = errorBody.success
      ? errorBody.data.message
      : fallbackMessage;

    const field = errorBody.success ? errorBody.data.field : undefined;

    throw new LoginError(message, response.status, field);
  }

  const result = loginResponseSchema.safeParse(body);

  if (!result.success) {
    throw new LoginError(
      'The server returned an unexpected response.',
      response.status
    );
  }

  return result.data;
};
