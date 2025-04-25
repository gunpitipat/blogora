import Alert from "./components/Alert"
import Navbar from "./components/Navbar"
import LoadingScreen from "./components/LoadingScreen"
import { useLoadingContext } from "./utils/LoadingContext"
import SessionExpiration from "./components/SessionExpiration"

const Layout = ({ children }) => {

    const { loading } = useLoadingContext()

    return (
        <div>
            <Navbar />
            {loading && <LoadingScreen />}
            {<SessionExpiration />} {/* Session expiration modal */}
            {children}
            <Alert />
        </div>
    )
}

export default Layout

// © 2025 Pitipat Pattamawilai. All Rights Reserved.