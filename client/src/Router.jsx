import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Explore from './pages/Explore/Explore'
import Form from './pages/Form/Form'
import BlogPage from './pages/BlogPage/BlogPage'
import EditBlog from './pages/EditBlog/EditBlog'
import Login from './pages/Login/Login'
import SignUp from './pages/SignUp/SignUp'
import Profile from './pages/Profile/Profile'
import { AlertProvider } from './contexts/AlertContext'
import Layout from './components/Layout/Layout'
import { LoadingProvider } from './contexts/LoadingContext'
import ProtectedRoute from './utils/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import NotFound from './pages/NotFound/NotFound'
import { ViewReplyProvider } from './contexts/ViewReplyContext'
import LandingPage from './pages/LandingPage/LandingPage'
import Preview from './pages/Preview/Preview'
import { DemoProvider } from './contexts/DemoContext'

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
            { path: "/signup", element: <SignUp /> },

            // Protected routes
            {
                element: <ProtectedRoute />,
                children: [
                    { path: "/create", element: <Form /> },
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