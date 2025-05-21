import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

const Router = () => {
    return(
        <BrowserRouter>
            <LoadingProvider>
                <AlertProvider>
                    <AuthProvider>
                        <DemoProvider>
                            <ViewReplyProvider>
                                <Layout>
                                    <Routes>
                                        <Route path="/" element={<LandingPage />} />
                                        <Route path="/explore" element={<Explore />} />
                                        <Route path="/blog/:slug" element={<BlogPage />} />
                                        <Route path="/profile/:username" element={<Profile />} />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/signup" element={<SignUp />} />

                                        {/* Protected Routes */}
                                        <Route element={<ProtectedRoute />}>
                                            <Route path="/create" element={<Form />} />
                                            <Route path="/blog/edit/:slug" element={<EditBlog />} />
                                            <Route path="/preview/:slug" element={<Preview />} />
                                        </Route>

                                        {/* Catch-all Route for undefined paths */}
                                        <Route path="*" element={<NotFound />} />
                                    </Routes> 
                                </Layout>
                            </ViewReplyProvider>
                        </DemoProvider>
                    </AuthProvider>
                </AlertProvider>
            </LoadingProvider>
        </BrowserRouter>
    )
}

export default Router

// © 2025 Pitipat Pattamawilai. All Rights Reserved.