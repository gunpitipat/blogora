import { Outlet } from "react-router-dom"
import { useAuthContext } from "../../contexts/AuthContext"
import { useLoadingContext } from "../../contexts/LoadingContext"
import Alert from "../Alert/Alert"
import LoadingScreen from "../LoadingScreen/LoadingScreen"
import Navbar from "./Navbar"
import ScrollToTop from "../../utils/ScrollToTop"
import SessionExpiration from "../Modals/SessionExpiration"

const Layout = () => {
    const { loading } = useLoadingContext()
    const { isAuthChecked } = useAuthContext()
    
    if (!isAuthChecked) return null
    
    return (
        <div>
            <ScrollToTop />
            <Navbar />
            <LoadingScreen isLoading={loading} />
            <SessionExpiration /> {/* Session expiration modal */}
            <Outlet /> {/* Render nested routes */}
            <Alert />
        </div>
    )
}

export default Layout

// © 2025 Pitipat Pattamawilai. All Rights Reserved.