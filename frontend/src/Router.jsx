import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppProviders from './AppProviders'
import LandingPage from './pages/LandingPage/LandingPage'
import Explore from './pages/Explore/Explore'
import BlogPage from './pages/BlogPage/BlogPage'
import CreateBlog from './pages/CreateBlog/CreateBlog'
import EditBlog from './pages/EditBlog/EditBlog'
import Preview from './pages/Preview/Preview'
import Profile from './pages/Profile/Profile'
import Login from './pages/Login/Login'
import Signup from "./pages/Signup/Signup"
import NotFound from './pages/NotFound/NotFound'
import ProtectedRoute from './utils/ProtectedRoute'

const router = createBrowserRouter([
    {
        path: "/",
        element: <AppProviders />,
        children: [
            { path: "/", element: <LandingPage /> },
            { path: "/explore", element: <Explore /> },
            { path: "/blog/:slug", element: <BlogPage /> },
            { path: "/profile/:username", element: <Profile /> },
            { path: "/login", element: <Login /> },
            { path: "/signup", element: <Signup /> },

            // Protected routes
            {
                element: <ProtectedRoute />,
                children: [
                    { path: "/create", element: <CreateBlog /> },
                    { path: "/blog/edit/:slug", element: <EditBlog /> },
                    { path: "/preview/:slug", element: <Preview /> }
                ]
            },

            // Undefined paths
            { path: "*", element: <NotFound /> }
        ]
    }
])

const Router = () => <RouterProvider router={router} />

export default  Router

// © 2025 Pitipat Pattamawilai. All Rights Reserved.