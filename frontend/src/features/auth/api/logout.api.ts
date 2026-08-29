import * as z from 'zod';
import { API_BASE_URL } from '@/config/env';

const logoutResponseSchema = z.object({
  message: z.string().min(1),
});

const logoutErrorResponseSchema = z.object({
  message: z.string().min(1),
});

export type LogoutResponse = z.infer<typeof logoutResponseSchema>;

export class LogoutError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'LogoutError';
    this.status = status;
  }
}

export const logout = async (): Promise<LogoutResponse> => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    throw new LogoutError('Network error. Please try again.');
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = logoutErrorResponseSchema.safeParse(body);
    const fallbackMessage =
      response.status >= 500
        ? 'Server error. Please try again later.'
        : 'Something went wrong. Please try again.';

    throw new LogoutError(
      errorBody.success ? errorBody.data.message : fallbackMessage,
      response.status
    );
  }

  const result = logoutResponseSchema.safeParse(body);

  if (!result.success) {
    throw new LogoutError(
      'The server returned an unexpected response.',
      response.status
    );
  }

  return result.data;
};
