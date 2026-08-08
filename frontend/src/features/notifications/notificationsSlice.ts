import { createSlice } from '@reduxjs/toolkit';

export type NotificationSeverity = 'error' | 'success';

export interface Notification {
  message: string;
  severity: NotificationSeverity;
}

export interface NotificationsState {
  queue: Notification[];
}

const initialState: NotificationsState = {
  queue: [],
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
});

export default notificationsSlice.reducer;
