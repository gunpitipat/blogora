import { Navigate, Outlet } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { sessionQueryOptions } from '@/features/auth/queries/session.query';

const GuestOnlyRoute = () => {
  const sessionQuery = useQuery(sessionQueryOptions);

  if (sessionQuery.isPending) return null;

  if (sessionQuery.data?.isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  // Still allow Login when the session query fails so the user can recover access.
  return <Outlet />;
};

export default GuestOnlyRoute;
