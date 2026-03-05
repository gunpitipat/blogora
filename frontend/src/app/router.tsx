import { createBrowserRouter } from 'react-router';
import RootLayout from '@/layouts/RootLayout';
import HomePage from '@/pages/HomePage';

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [{ index: true, Component: HomePage }],
  },
]);
