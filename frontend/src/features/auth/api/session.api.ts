import * as z from 'zod';
import { API_BASE_URL } from '@/config/env';

const authenticatedSessionSchema = z.object({
  isAuthenticated: z.literal(true),
  username: z.string().min(1),
  role: z.enum(['user', 'admin', 'demo']),
});

const unauthenticatedSessionSchema = z.object({
  isAuthenticated: z.literal(false),
});

const sessionResponseSchema = z.discriminatedUnion('isAuthenticated', [
  authenticatedSessionSchema,
  unauthenticatedSessionSchema,
]);

export type AuthSession = z.infer<typeof sessionResponseSchema>;

export const UNAUTHENTICATED_SESSION: AuthSession = {
  isAuthenticated: false,
};

export class SessionError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'SessionError';
    this.status = status;
  }
}

export const fetchSession = async (): Promise<AuthSession> => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/check-auth`, {
      credentials: 'include',
    });
  } catch {
    throw new SessionError('Network error. Please try again.');
  }

  const body: unknown = await response.json().catch(() => null);
  const result = sessionResponseSchema.safeParse(body);

  if (
    (response.status === 401 || response.status === 403) &&
    result.success &&
    !result.data.isAuthenticated
  ) {
    return result.data;
  }

  if (!response.ok) {
    throw new SessionError(
      response.status >= 500
        ? 'Server error. Please try again later.'
        : 'Something went wrong. Please try again.',
      response.status
    );
  }

  if (!result.success) {
    throw new SessionError(
      'The server returned an unexpected response.',
      response.status
    );
  }

  return result.data;
};
