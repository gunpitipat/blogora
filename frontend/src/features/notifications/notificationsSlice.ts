import {
  createSelector,
  createSlice,
  nanoid,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { MAX_VISIBLE_NOTIFICATIONS } from '@/features/notifications/notifications.constants';

export type NotificationSeverity = 'success' | 'error';

export interface Notification {
  id: string;
  message: string;
  severity: NotificationSeverity;
}

export type EnqueueNotificationPayload = Omit<Notification, 'id'>;

export interface NotificationsState {
  queue: Notification[];
}

const initialState: NotificationsState = {
  queue: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    enqueueNotification: {
      reducer: (state, action: PayloadAction<Notification>) => {
        state.queue.push(action.payload);
      },
      prepare: (notification: EnqueueNotificationPayload) => ({
        payload: {
          ...notification,
          id: nanoid(),
        },
      }),
    },
    dismissNotification: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter(
        (notification) => notification.id !== action.payload
      );
    },
  },
  selectors: {
    selectVisibleNotifications: createSelector(
      [(state: NotificationsState) => state.queue],
      (queue) => queue.slice(0, MAX_VISIBLE_NOTIFICATIONS)
    ),
  },
});

export const { enqueueNotification, dismissNotification } =
  notificationsSlice.actions;
export const { selectVisibleNotifications } = notificationsSlice.selectors;

export default notificationsSlice.reducer;
