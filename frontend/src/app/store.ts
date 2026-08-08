import { configureStore } from '@reduxjs/toolkit';
import notificationsReducer from '@/features/notifications/notificationsSlice';

export const store = configureStore({
  reducer: {
    notifications: notificationsReducer,
  },
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
