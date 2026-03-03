import "./TryDemoButton.css"
import api from "@/utils/api"
import { useNavigate } from "react-router-dom"
import { useAlertContext } from "@/contexts/AlertContext"
import { useDemoContext } from "@/contexts/DemoContext"
import { useLoadingContext } from "@/contexts/LoadingContext"
import { TTL_MINUTES_BEFORE_LOGIN, LOGIN_BUFFER_MINUTES } from "@/utils/demoConstants"

const TryDemoButton = () => {
    const { setAlertState } = useAlertContext()
    const { setPrefillDemo, setShowDemoPopup } = useDemoContext()
    const { setLoading } = useLoadingContext()
    const navigate = useNavigate()

    const handleTryDemo = async () => {
        setLoading(true)
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
            
            const response = await api.post("/demo/signup",
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

            setLoading(false)
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
            setLoading(false)
        }
    }

    return (
        <button className="try-demo-btn" onClick={handleTryDemo}>
            Try Demo
        </button>
    )
}

export default TryDemoButton

// © 2025 Pitipat Pattamawilai. All Rights Reserved.