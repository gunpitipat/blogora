import "./Login.css"
import api from "@/utils/api"
import clsx from "clsx"
import { useEffect, useState } from "react"
import { Link, useNavigate, Navigate } from "react-router-dom"
import { useAlertContext } from "@/contexts/AlertContext"
import { useAuthContext } from "@/contexts/AuthContext"
import { useLoadingContext } from "@/contexts/LoadingContext"
import { useDemoContext } from "@/contexts/DemoContext"
import DemoPopup from "@/components/Popups/DemoPopup"
import { FaEye, FaEyeSlash } from "react-icons/fa"

const Login = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const initialErrorStatus = { message: "", field: "" }
    const [errorStatus, setErrorStatus] = useState(initialErrorStatus)

    const navigate = useNavigate()
    const { setLoading } = useLoadingContext()
    const { setAlertState } = useAlertContext()
    const { isAuthenticated, user, checkAuth } = useAuthContext()
    const { prefillDemo, setPrefillDemo } = useDemoContext()

    // Auto-prefill credentials for demo users
    useEffect(() => {        
        if (!prefillDemo) return

        try {
            const TTL_MINUTES_BEFORE_LOGIN = 15
            const LOGIN_BUFFER_MINUTES = 3
            const demoCredentials = JSON.parse(localStorage.getItem("demoCredentials"))

            const isInvalid = !demoCredentials ||
                !demoCredentials.username ||
                !demoCredentials.password || 
                Date.now() - demoCredentials.createdAt > (TTL_MINUTES_BEFORE_LOGIN - LOGIN_BUFFER_MINUTES) * 60 * 1000
            
            if (isInvalid) {
                localStorage.removeItem("demoCredentials") 
                setAlertState({ display: true, type: "error", message: "Demo expired. Please try again." })
                navigate("/")
                return
            }

            setUsername(demoCredentials.username)
            setPassword(demoCredentials.password)
        
        } catch {
            // In case of corrupted JSON
            localStorage.removeItem("demoCredentials") 
            setAlertState({ display: true, type: "error", message: "Something went wrong. Please try again." })
            navigate("/")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Submit data
    const handleFormSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await api.post("/login", { username, password })
            await checkAuth() // Ensures token cookie is actually set and valid before updating the state
            setUsername("")
            setPassword("")
            setErrorStatus(initialErrorStatus)
            setLoading(false)
            setAlertState({ display: true, type: "success", message: response.data.message })
            localStorage.setItem("isLoggedIn", "true")
            localStorage.removeItem("demoCredentials")
            setPrefillDemo(false)
            navigate("/explore")
            
        } catch (error) {
            if (!error.response) {
                setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
                return
            } else if (error.response.status === 500) {
                setAlertState({ display: true, type: "error", message: error.response.data?.message || "Server error. Please try again later." })
                return
            } else {
                const { message, field } = error.response.data
                setErrorStatus({ message, field })    
            }
        
        } finally {
            setLoading(false)
        }
    }

    if (isAuthenticated && user?.username) return <Navigate to="/explore" />

    return(
        <div className="login">
            <div className="container">
                <h2 className="headline">
                    Log In
                </h2>
                <form onSubmit={handleFormSubmit}>
                    <div className={clsx("form-group", errorStatus.field === "username" && "error")}>
                        <label>Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            name="username"
                            autoComplete="username"   
                            inputMode="text" 
                        />
                        { errorStatus.field === "username" &&
                            <small>{errorStatus.message}</small>
                        }
                    </div>

                    <div className={clsx("form-group", errorStatus.field === "password" && "error")}>
                        <label>Password</label>
                        <div className="password-frame">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                autoComplete="current-password"
                                className="password-field"
                            />
                            <span className="password-icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </span>
                        </div>
                        { errorStatus.field === "password" && 
                            <small>{errorStatus.message}</small>
                        }
                    </div>

                    <button type="submit" className="login-btn">
                        Log In
                    </button>

                    <footer className="signup-link">
                        <p>Don't have an account?&nbsp;</p>
                        <Link to="/signup">
                            Sign Up
                        </Link>
                    </footer>
                </form>
            </div> 
            <DemoPopup />
        </div>
    )
}

export default Login

// © 2025 Pitipat Pattamawilai. All Rights Reserved.