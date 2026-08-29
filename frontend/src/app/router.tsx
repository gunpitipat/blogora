import { createBrowserRouter } from 'react-router';
import RootLayout from '@/layouts/RootLayout';
import HomePage from '@/pages/HomePage';
import ExplorePage from '@/pages/ExplorePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import GuestOnlyRoute from '@/features/auth/routes/GuestOnlyRoute';

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'explore', Component: ExplorePage },
      {
        Component: GuestOnlyRoute,
        children: [{ path: 'login', Component: LoginPage }],
      },
      { path: 'signup', Component: SignupPage },
    ],
  },
]);
