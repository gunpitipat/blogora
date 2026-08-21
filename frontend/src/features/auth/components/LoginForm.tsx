import { useState } from 'react';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
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
import { useAppDispatch } from '@/app/hooks';
import { enqueueNotification } from '@/features/notifications/notificationsSlice';

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
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
    if (loginMutation.isError) {
      loginMutation.reset();
    }
  };

  const handleLogin: SubmitHandler<LoginCredentials> = async (credentials) => {
    try {
      const response = await loginMutation.mutateAsync(credentials);
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
          fullWidth
          helperText={errors.username?.message}
          label="Username"
          {...register('username', {
            onChange: () => clearServerFeedback('username'),
          })}
        />

        <AuthTextField
          autoComplete="current-password"
          disabled={isPending}
          error={Boolean(errors.password)}
          fullWidth
          helperText={errors.password?.message}
          label="Password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end" sx={{ mr: 0.5 }}>
                  <IconButton
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showPassword}
                    disabled={isPending}
                    edge="end"
                    onClick={() => setShowPassword((visible) => !visible)}
                    // Prevent a mouse click from stealing focus from the password input
                    onMouseDown={(event) => event.preventDefault()}
                    sx={{ color: 'primary.main' }}
                  >
                    {showPassword ? (
                      <VisibilityIcon fontSize="small" />
                    ) : (
                      <VisibilityOffIcon fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          type={showPassword ? 'text' : 'password'}
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
