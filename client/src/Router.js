import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Form from './components/Form'
import BlogComponent from './components/BlogComponent'
import EditComponent from './components/EditComponent'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Profile from './components/Profile'
import { AlertProvider } from './utils/AlertContext'
import Layout from './Layout'
import { LoadingProvider } from './utils/LoadingContext'
import ProtectedRoute from './utils/ProtectedRoute'
import { AuthProvider } from './utils/AuthContext'
import NotFound from './components/NotFound'
import { ViewReplyProvider } from './utils/ViewReplyContext'
import LandingPage from './LandingPage'
import Preview from './components/Preview'
import { DemoProvider } from './utils/DemoContext'

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
                                        <Route path="/explore" element={<App />} />
                                        <Route path="/blog/:slug" element={<BlogComponent />} />
                                        <Route path="/profile/:username" element={<Profile />} />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/signup" element={<SignUp />} />

                                        {/* Protected Routes */}
                                        <Route element={<ProtectedRoute />}>
                                            <Route path="/create" element={<Form />} />
                                            <Route path="/blog/edit/:slug" element={<EditComponent />} />
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