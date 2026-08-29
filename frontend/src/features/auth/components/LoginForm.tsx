import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import AuthPasswordField from '@/features/auth/components/AuthPasswordField';
import AuthTextField from '@/features/auth/components/AuthTextField';
import {
  login,
  LoginError,
  type LoginResponse,
} from '@/features/auth/api/login.api';
import {
  loginSchema,
  type LoginCredentials,
  type LoginFormInput,
} from '@/features/auth/schemas/login.schema';
import { sessionQueryOptions } from '@/features/auth/queries/session.query';
import { useAppDispatch } from '@/app/hooks';
import { enqueueNotification } from '@/features/notifications/notificationsSlice';

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const loginMutation = useMutation<
    LoginResponse,
    LoginError,
    LoginCredentials
  >({
    mutationKey: ['auth', 'login'],
    mutationFn: login,
  });
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormInput, unknown, LoginCredentials>({
    defaultValues: { username: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  // Clears the outdated server error once the user edits the field
  const clearServerFeedback = (field: keyof LoginFormInput) => {
    if (errors[field]?.type === 'server') clearErrors(field);
    if (loginMutation.isError) loginMutation.reset();
  };

  const handleLogin: SubmitHandler<LoginCredentials> = async (credentials) => {
    try {
      const response = await loginMutation.mutateAsync(credentials);
      await queryClient.invalidateQueries({
        queryKey: sessionQueryOptions.queryKey,
      });
      dispatch(
        enqueueNotification({
          message: response.message,
          severity: 'success',
        })
      );
      navigate('/', { replace: true });
    } catch (error) {
      if (!(error instanceof LoginError)) {
        dispatch(
          enqueueNotification({
            message: 'Something went wrong. Please try again.',
            severity: 'error',
          })
        );
        return;
      }

      if (error.field) {
        setError(
          error.field,
          { type: 'server', message: error.message },
          { shouldFocus: true }
        );
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

  const isPending = isSubmitting || loginMutation.isPending;

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(handleLogin)}>
      <Stack spacing={3}>
        <AuthTextField
          autoComplete="username"
          autoFocus
          disabled={isPending}
          error={Boolean(errors.username)}
          helperText={errors.username?.message}
          label="Username"
          {...register('username', {
            onChange: () => clearServerFeedback('username'),
          })}
        />

        <AuthPasswordField
          autoComplete="current-password"
          disabled={isPending}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          label="Password"
          {...register('password', {
            onChange: () => clearServerFeedback('password'),
          })}
        />

        <Button
          fullWidth
          loading={isPending}
          size="large"
          type="submit"
          variant="contained"
        >
          Log In
        </Button>
      </Stack>
    </Box>
  );
};

export default LoginForm;
