import { Navigate, Outlet } from "react-router-dom"
import { useAuthContext } from "./AuthContext"
import LoadingScreen from "../components/LoadingScreen"

const ProtectedRoute = () => {
    const { isAuthenticated } = useAuthContext() 

    // ProtectedRoute will be rendered when its own child route componentes are accessed.
    // On app startup, AuthProvider already runs checkAuth(), by the time ProtectedRoute renders, isAuthenticated is already either false of true.
    // This means authentication has been determined, no need checkAuth and useEffect to call it in ProtectedRoute.
    // isAuthenticated in AuthContext is always up to date. If users refresh app, AuthProvider will run checkAuth and get authentication status again.
    
    if (isAuthenticated === null) return <LoadingScreen /> // Prevents premature redirection
    // isAuthenticated would be null and show LoadingScreen only in case users start app on url path of the protected route
    // otherwise any other cases, isAuthenticated is already either false or true when initally app render

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute

// © 2025 Pitipat Pattamawilai. All Rights Reserved.