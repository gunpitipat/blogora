import { Link as RouterLink } from 'react-router';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import AuthPageLayout from '@/features/auth/components/AuthPageLayout';
import SignupForm from '@/features/auth/components/SignupForm';

const SignupPage = () => {
  return (
    <AuthPageLayout title="Sign Up">
      <SignupForm />
      <Typography color="text.secondary" textAlign="center" variant="body2">
        Already have an account?{' '}
        <Link
          component={RouterLink}
          fontWeight={600}
          sx={{ whiteSpace: 'nowrap' }}
          to="/login"
          underline="hover"
        >
          Log In
        </Link>
      </Typography>
    </AuthPageLayout>
  );
};

export default SignupPage;
