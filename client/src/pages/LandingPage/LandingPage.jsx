import axios from "axios"
import "./LandingPage.css"
import { useEffect, useState } from "react"
import { useAlertContext } from "../../contexts/AlertContext";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen"
import { useDemoContext } from "../../contexts/DemoContext"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "../../contexts/AuthContext";

const LandingPage = () => {
    const [tryDemoLoading, setTryDemoLoading] = useState(false)

    const { setAlertState } = useAlertContext()
    const { setPrefillDemo, setShowDemoPopup } = useDemoContext()
    const { isAuthenticated, user } = useAuthContext()

    const navigate = useNavigate()

    const TTL_MINUTES_BEFORE_LOGIN = 15
    const LOGIN_BUFFER_MINUTES = 3

    // Cleanup demoCrendentials in localStorage
    useEffect(() => {
        try {
            const demoCredentials = JSON.parse(localStorage.getItem("demoCredentials"))
            if (!demoCredentials) return

            // If a user clicked 'Try Demo' and never logs in
            if (Date.now() - demoCredentials.createdAt > (TTL_MINUTES_BEFORE_LOGIN - LOGIN_BUFFER_MINUTES) * 60 * 1000) {
                localStorage.removeItem("demoCredentials")
            }
        } catch (error) {
            // In case of corrupted JSON, clean it up
            localStorage.removeItem("demoCredentials")
        }
    }, [])

    const handleTryDemo = async () => {
        setTryDemoLoading(true)
        try {
            let demoCredentials = null
            let reuseCredentials = false

            try {
                demoCredentials = JSON.parse(localStorage.getItem("demoCredentials"))
                reuseCredentials = demoCredentials && 
                    Date.now() - demoCredentials.createdAt <= (TTL_MINUTES_BEFORE_LOGIN - LOGIN_BUFFER_MINUTES) * 60 * 1000
            } catch {
                localStorage.removeItem("demoCredentials") // In case of corrupted JSON
            }
            
            const response = await axios.post(`${process.env.REACT_APP_API}/demo/signup`,
                reuseCredentials 
                    ? { savedUsername: demoCredentials.username, savedPassword: demoCredentials.password }
                    : {}
            )

            const isSameUser = reuseCredentials && demoCredentials.username === response.data.username

            localStorage.setItem("demoCredentials", JSON.stringify({
                username: response.data.username,
                password: response.data.password,
                createdAt: isSameUser ? demoCredentials.createdAt : Date.now() // Timestamp to check for reuse
            }))

            setTryDemoLoading(false)
            setPrefillDemo(true)
            setShowDemoPopup(true)
            navigate("/login")

        } catch (error) {
            if (!error.response) {
                setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
            } else {
                setAlertState({ display: true, type: "error", message: error.response.data?.message || "Something went wrong. Please try again." })
            }
        } finally {
            setTryDemoLoading(false)
        }
    }

    return (
        <div className="LandingPage">
            {!(isAuthenticated && user?.username) &&
                <button className="btn try-demo" onClick={handleTryDemo}>Try Demo</button>
            }
            {tryDemoLoading && <LoadingScreen />}
        </div>
    )
}

export default LandingPage

// © 2025 Pitipat Pattamawilai. All Rights Reserved.