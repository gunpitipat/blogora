import { Navigate, Outlet } from "react-router-dom"
import { useAuthContext } from "../contexts/AuthContext"
import LoadingScreen from "../components/LoadingScreen/LoadingScreen"

const ProtectedRoute = () => { // ProtectedRoute will be rendered when its own child route components are accessed.
    const { isAuthenticated } = useAuthContext() 
    
    if (isAuthenticated === null) return <LoadingScreen isLoading={true} /> // Prevents premature redirection
    // Show LoadingScreen only when the user starts app on url path of the protected route

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute

// © 2025 Pitipat Pattamawilai. All Rights Reserved.