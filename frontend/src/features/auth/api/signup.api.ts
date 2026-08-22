import * as z from 'zod';
import { API_BASE_URL } from '@/config/env';
import type {
  SignupCredentials,
  SignupField,
} from '@/features/auth/schemas/signup.schema';

const signupApiFieldSchema = z.enum([
  'email',
  'username',
  'password',
  'cfpassword',
]);

const signupResponseSchema = z.object({
  message: z.string().min(1),
});

const signupValidationErrorResponseSchema = z.object({
  error: z
    .array(
      z.object({
        field: signupApiFieldSchema,
        message: z.string().min(1),
      })
    )
    .min(1),
});

const signupErrorResponseSchema = z.object({
  message: z.string().min(1),
});

type SignupApiField = z.infer<typeof signupApiFieldSchema>;

const signupFieldByApiField: Record<SignupApiField, SignupField> = {
  email: 'email',
  username: 'username',
  password: 'password',
  cfpassword: 'confirmPassword',
};

export interface SignupFieldError {
  field: SignupField;
  message: string;
}

export type SignupResponse = z.infer<typeof signupResponseSchema>;

export class SignupError extends Error {
  readonly fieldErrors: SignupFieldError[];
  readonly status: number | undefined;

  constructor(
    message: string,
    status?: number,
    fieldErrors: SignupFieldError[] = []
  ) {
    super(message);
    this.name = 'SignupError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export const signup = async (
  credentials: SignupCredentials
): Promise<SignupResponse> => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new SignupError('Network error. Please try again.');
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const validationError = signupValidationErrorResponseSchema.safeParse(body);

    if (validationError.success) {
      const fieldErrors = validationError.data.error.map((error) => ({
        field: signupFieldByApiField[error.field],
        message: error.message,
      }));

      throw new SignupError(
        'Please correct the highlighted fields.',
        response.status,
        fieldErrors
      );
    }

    const errorBody = signupErrorResponseSchema.safeParse(body);
    const fallbackMessage =
      response.status >= 500
        ? 'Server error. Please try again later.'
        : 'Something went wrong. Please try again.';

    throw new SignupError(
      errorBody.success ? errorBody.data.message : fallbackMessage,
      response.status
    );
  }

  const result = signupResponseSchema.safeParse(body);

  if (!result.success) {
    throw new SignupError(
      'The server returned an unexpected response.',
      response.status
    );
  }

  return result.data;
};
