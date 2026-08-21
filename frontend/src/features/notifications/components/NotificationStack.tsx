import { useState, type SyntheticEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Fade from '@mui/material/Fade';
import Snackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  NOTIFICATION_AUTO_HIDE_DURATION_MS,
  NOTIFICATION_TRANSITION_DURATION_MS,
} from '@/features/notifications/notifications.constants';
import {
  dismissNotification,
  selectVisibleNotifications,
  type Notification,
} from '@/features/notifications/notificationsSlice';

const NOTIFICATION_HORIZONTAL_GUTTER = 1.5;

interface NotificationSnackbarProps {
  notification: Notification;
  onExited: (id: string) => void;
}

const NotificationSnackbar = ({
  notification,
  onExited,
}: NotificationSnackbarProps) => {
  // On exit, fade the notification first, then collapse its preserved space
  // so the remaining notifications above slide down smoothly.
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(true);

  const handleClose = (
    event: SyntheticEvent | Event,
    reason: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') return;
    if (reason === 'escapeKeyDown') {
      // Prevent Escape from dismissing every mounted Snackbar
      event.preventDefault();
    }

    setVisible(false);
  };

  // Bottom padding on Box inside Collapse provides spacing between notifications
  // and prevents the Alert's box-shadow from being clipped by Collapse on enter.
  // Negative horizontal margin only offsets the side padding to keep the width.
  return (
    <Collapse
      appear
      in={expanded}
      onExited={() => onExited(notification.id)}
      timeout={NOTIFICATION_TRANSITION_DURATION_MS}
      sx={{ mx: -NOTIFICATION_HORIZONTAL_GUTTER }}
    >
      <Fade
        appear
        in={visible}
        onExited={() => setExpanded(false)}
        timeout={NOTIFICATION_TRANSITION_DURATION_MS}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            px: NOTIFICATION_HORIZONTAL_GUTTER,
            pb: 1.5,
            pointerEvents: 'none',
          }}
        >
          <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            autoHideDuration={NOTIFICATION_AUTO_HIDE_DURATION_MS}
            onClose={handleClose}
            open
            transitionDuration={0} // Disable internal transition
            sx={{
              pointerEvents: 'auto',
              position: 'static',
              transform: 'none !important',
              width: 'fit-content',
            }}
          >
            <Alert
              onClose={() => setVisible(false)}
              severity={notification.severity}
              variant="filled"
              sx={{
                alignItems: 'center',
                borderRadius: 1,
                boxShadow: 4,
                px: 2.5,
                '& .MuiAlert-action': {
                  mr: 0,
                  pt: 0,
                },
                '& .MuiAlert-message': {
                  py: 0.5,
                },
              }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Box>
      </Fade>
    </Collapse>
  );
};

const NotificationStack = () => {
  const dispatch = useAppDispatch();
  const visibleNotifications = useAppSelector(selectVisibleNotifications);

  if (visibleNotifications.length === 0) return null;

  return (
    <Stack
      sx={(theme) => ({
        bottom: theme.spacing(2.5),
        left: '50%',
        pointerEvents: 'none',
        position: 'fixed',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        zIndex: theme.zIndex.snackbar,
      })}
    >
      {visibleNotifications.map((notification) => (
        <NotificationSnackbar
          key={notification.id}
          notification={notification}
          onExited={(id) => dispatch(dismissNotification(id))}
        />
      ))}
    </Stack>
  );
};

export default NotificationStack;
