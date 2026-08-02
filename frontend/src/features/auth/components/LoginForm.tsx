import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import Alert from '@mui/material/Alert';
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

const LoginForm = () => {
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

  const clearServerFeedback = (field: keyof LoginFormInput) => {
    if (errors[field]?.type === 'server') clearErrors(field);
    // Remove isSuccess once login redirects and success feedback moves globally.
    if (loginMutation.isError || loginMutation.isSuccess) {
      loginMutation.reset();
    }
  };

  const handleLogin: SubmitHandler<LoginCredentials> = async (credentials) => {
    try {
      await loginMutation.mutateAsync(credentials);
    } catch (error) {
      if (error instanceof LoginError && error.field) {
        setError(
          error.field,
          { type: 'server', message: error.message },
          { shouldFocus: true }
        );
      }
    }
  };

  const isPending = isSubmitting || loginMutation.isPending;
  const requestError =
    loginMutation.isError && !loginMutation.error.field
      ? loginMutation.error.message
      : null;

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

        {requestError && <Alert severity="error">{requestError}</Alert>}
        {loginMutation.isSuccess && (
          <Alert severity="success">{loginMutation.data.message}</Alert>
        )}
      </Stack>
    </Box>
  );
};

export default LoginForm;
