import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LandingPage from './pages/LandingPage/LandingPage'
import Explore from './pages/Explore/Explore'
import BlogPage from './pages/BlogPage/BlogPage'
import CreateBlog from './pages/CreateBlog/CreateBlog'
import EditBlog from './pages/EditBlog/EditBlog'
import Preview from './pages/Preview/Preview'
import Profile from './pages/Profile/Profile'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import NotFound from './pages/NotFound/NotFound'
import ProtectedRoute from './utils/ProtectedRoute'
import Layout from './components/Layout/Layout'
import { AlertProvider } from './contexts/AlertContext'
import { AuthProvider } from './contexts/AuthContext'
import { DemoProvider } from './contexts/DemoContext'
import { LoadingProvider } from './contexts/LoadingContext'
import { ViewReplyProvider } from './contexts/ViewReplyContext'

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

function AppProviders() {
    return (
        <LoadingProvider>
            <AlertProvider>
                <AuthProvider>
                    <DemoProvider>
                        <ViewReplyProvider>
                            <Layout />
                        </ViewReplyProvider>
                    </DemoProvider>
                </AuthProvider>
            </AlertProvider>
        </LoadingProvider>
    )
}

const Router = () => <RouterProvider router={router} />

export default  Router

// © 2025 Pitipat Pattamawilai. All Rights Reserved.