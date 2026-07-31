import { Outlet } from 'react-router';
import Navbar from '@/layouts/navbar/Navbar';

const RootLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default RootLayout;
