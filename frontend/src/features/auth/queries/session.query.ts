import { queryOptions } from '@tanstack/react-query';
import { fetchSession } from '@/features/auth/api/session.api';

export const sessionQueryOptions = queryOptions({
  queryKey: ['auth', 'session'],
  queryFn: fetchSession,
  staleTime: 0,
});
