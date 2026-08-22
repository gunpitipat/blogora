import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import AuthPasswordField from '@/features/auth/components/AuthPasswordField';
import AuthTextField from '@/features/auth/components/AuthTextField';
import {
  signup,
  SignupError,
  type SignupResponse,
} from '@/features/auth/api/signup.api';
import {
  signupSchema,
  type SignupCredentials,
  type SignupField,
  type SignupFormInput,
} from '@/features/auth/schemas/signup.schema';
import { useAppDispatch } from '@/app/hooks';
import { enqueueNotification } from '@/features/notifications/notificationsSlice';

const SignupForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const signupMutation = useMutation<
    SignupResponse,
    SignupError,
    SignupCredentials
  >({
    mutationKey: ['auth', 'signup'],
    mutationFn: signup,
  });
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<SignupFormInput, unknown, SignupCredentials>({
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(signupSchema),
  });

  // Clears the outdated server error once the user edits the field
  const clearServerFeedback = (field: SignupField) => {
    if (errors[field]?.type === 'server') clearErrors(field);
    if (signupMutation.isError) signupMutation.reset();
  };

  const handleSignup: SubmitHandler<SignupCredentials> = async (
    credentials
  ) => {
    try {
      const response = await signupMutation.mutateAsync(credentials);
      dispatch(
        enqueueNotification({
          message: response.message,
          severity: 'success',
        })
      );
      navigate('/login', { replace: true });
    } catch (error) {
      if (!(error instanceof SignupError)) {
        dispatch(
          enqueueNotification({
            message: 'Something went wrong. Please try again.',
            severity: 'error',
          })
        );
        return;
      }

      if (error.fieldErrors.length > 0) {
        error.fieldErrors.forEach(({ field, message }, index) => {
          setError(
            field,
            { type: 'server', message },
            { shouldFocus: index === 0 }
          );
        });
        return;
      }

      dispatch(
        enqueueNotification({
          message: error.message,
          severity: 'error',
        })
      );
    }
  };

  const isPending = isSubmitting || signupMutation.isPending;

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(handleSignup)}>
      <Stack spacing={3}>
        <AuthTextField
          autoComplete="email"
          autoFocus
          disabled={isPending}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          label="Email"
          type="email"
          {...register('email', {
            onChange: () => clearServerFeedback('email'),
          })}
        />

        <AuthTextField
          autoComplete="username"
          disabled={isPending}
          error={Boolean(errors.username)}
          helperText={errors.username?.message}
          label="Username"
          {...register('username', {
            onChange: () => clearServerFeedback('username'),
          })}
        />

        <AuthPasswordField
          autoComplete="new-password"
          disabled={isPending}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          label="Password"
          {...register('password', {
            onChange: () => clearServerFeedback('password'),
          })}
        />

        <AuthPasswordField
          autoComplete="new-password"
          disabled={isPending}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message}
          label="Confirm Password"
          {...register('confirmPassword', {
            onChange: () => clearServerFeedback('confirmPassword'),
          })}
        />

        <Button
          fullWidth
          loading={isPending}
          size="large"
          type="submit"
          variant="contained"
        >
          Sign Up
        </Button>
      </Stack>
    </Box>
  );
};

export default SignupForm;
