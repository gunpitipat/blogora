import Alert from "./components/Alert"
import Navbar from "./components/Navbar"
import LoadingScreen from "./components/LoadingScreen"
import { useLoadingContext } from "./services/LoadingContext"

const Layout = ({ children }) => {

    const { loading } = useLoadingContext()

    return (
        <div>
            <Navbar />
            {loading && <LoadingScreen/>}
            {children}
            <Alert />
        </div>
    )
}

export default Layout

// © 2025 Pitipat Pattamawilai. All Rights Reserved.