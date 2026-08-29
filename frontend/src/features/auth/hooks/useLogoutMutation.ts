import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '@/app/hooks';
import { logout, LogoutError } from '@/features/auth/api/logout.api';
import { UNAUTHENTICATED_SESSION } from '@/features/auth/api/session.api';
import { sessionQueryOptions } from '@/features/auth/queries/session.query';
import { enqueueNotification } from '@/features/notifications/notificationsSlice';

const useLogoutMutation = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: logout,
    onSuccess: (response) => {
      queryClient.setQueryData(
        sessionQueryOptions.queryKey,
        UNAUTHENTICATED_SESSION
      );
      dispatch(
        enqueueNotification({
          message: response.message,
          severity: 'success',
        })
      );
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      dispatch(
        enqueueNotification({
          message:
            error instanceof LogoutError
              ? error.message
              : 'Something went wrong. Please try again.',
          severity: 'error',
        })
      );
    },
  });
};

export default useLogoutMutation;
