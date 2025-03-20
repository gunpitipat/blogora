import { Navigate, Outlet } from "react-router-dom"
import { useAuthContext } from "./AuthContext"
import LoadingScreen from "../components/LoadingScreen"

const ProtectedRoute = () => { // ProtectedRoute will be rendered when its own child route components are accessed.
    const { isAuthenticated } = useAuthContext() 
    
    if (isAuthenticated === null) return <LoadingScreen /> // Prevents premature redirection
    // isAuthenticated is null, showing LoadingScreen only when the user starts app on url path of the protected route

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute

// © 2025 Pitipat Pattamawilai. All Rights Reserved.