import Alert from "../Alert/Alert"
import Navbar from "./Navbar"
import LoadingScreen from "../LoadingScreen/LoadingScreen"
import { useLoadingContext } from "../../contexts/LoadingContext"
import SessionExpiration from "../Modals/SessionExpiration"
import { Outlet } from "react-router-dom"

const Layout = () => {
    const { loading } = useLoadingContext()

    return (
        <div>
            <Navbar />
            {loading && <LoadingScreen />}
            {<SessionExpiration />} {/* Session expiration modal */}
            <Outlet /> {/* Render nested routes */}
            <Alert />
        </div>
    )
}

export default Layout

// © 2025 Pitipat Pattamawilai. All Rights Reserved.