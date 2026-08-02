import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoginForm from '@/features/auth/components/LoginForm';
import { NAVBAR_HEIGHT } from '@/layouts/navbar/navbar.constants';

const LoginPage = () => {
  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        alignItems: 'center',
        display: 'flex',
        minHeight: `calc(100dvh - ${NAVBAR_HEIGHT}px)`,
        py: { xs: 4, sm: 6 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: (theme) => alpha(theme.palette.divider, 0.5),
          borderRadius: 2,
          p: { xs: 3, sm: 4 },
          width: '100%',
        }}
      >
        <Stack spacing={3}>
          <Typography
            component="h1"
            fontWeight="600"
            textAlign="center"
            variant="h6"
          >
            Log In
          </Typography>
          <LoginForm />
        </Stack>
      </Paper>
    </Container>
  );
};

export default LoginPage;
