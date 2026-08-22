import type { ReactNode } from 'react';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { NAVBAR_HEIGHT } from '@/layouts/navbar/navbar.constants';

interface AuthPageLayoutProps {
  children: ReactNode;
  title: string;
}

const AuthPageLayout = ({ children, title }: AuthPageLayoutProps) => {
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
          p: { xs: 4, sm: 5 },
          pb: { xs: 5, sm: 6 },
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
            {title}
          </Typography>
          {children}
        </Stack>
      </Paper>
    </Container>
  );
};

export default AuthPageLayout;
