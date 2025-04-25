import "./Login.css"
import { Link, useNavigate, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { useAlertContext } from "../utils/AlertContext"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLoadingContext } from "../utils/LoadingContext"
import { useAuthContext } from "../utils/AuthContext"
import LoadingScreen from "./LoadingScreen"
import { useDemoContext } from "../utils/DemoContext"
import DemoPopUp from "./DemoPopUp"

const Login = () => {
    const [ username, setUsername ] = useState("")
    const [ password, setPassword ] = useState("")

    const [ showPassword, setShowPassword ] = useState(false)

    const initialErrorStatus = { message: "", field: "" }
    const [ errorStatus, setErrorStatus ] = useState(initialErrorStatus)

    const navigate = useNavigate()
    
    const { loading, setLoading } = useLoadingContext()
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
        // eslint-disable-next-line
    }, [])

    // Submit form
    const submitForm = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await axios.post(`${process.env.REACT_APP_API}/login`,
                { username, password },
                { withCredentials: true } // Send request with credentials to ensure cookie can be sent back from backend and stored by browser
            )
            await checkAuth() // Ensures token cookie is actually set and valid before updating the state
            setUsername("")
            setPassword("")
            setErrorStatus(initialErrorStatus)
            setAlertState({ display: true, type: "success", message: response.data.message })
            setLoading(false)
            localStorage.setItem("isLogin", "true")
            localStorage.removeItem("demoCredentials")
            setPrefillDemo(false)
            navigate("/explore")
        } catch (error) {
            setLoading(false)
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
        }
    }

    if (loading) return <LoadingScreen />
    if (isAuthenticated && user?.username) return <Navigate to="/explore" />

    return(
        <div className="Login">
            <div className="bg">
                <h2 className="headline">Log In</h2>
                <form onSubmit={submitForm}>
                    <div className={errorStatus.field === "username" ? "showError" : null}>
                        <label>Username</label>
                        <input type="text" 
                            value={username} 
                            onChange={(e)=>setUsername(e.target.value)}
                            name="username"
                            autoComplete="username"   
                            inputMode="text" 
                        />
                        <small>{errorStatus.message}</small>
                    </div>
                    <div className={errorStatus.field === "password" ? "showError" : null}>
                        <label>Password</label>
                        <div className="password-frame">
                            <input type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e)=>setPassword(e.target.value)} 
                                id="password" 
                                autoComplete="current-password"
                            />
                            <span className="password-icon" onClick={()=>setShowPassword(!showPassword)}>
                                {showPassword ? <FaEye/> : <FaEyeSlash/>}
                            </span>
                        </div>
                        <small>{errorStatus.message}</small>
                    </div>
                    <button type="submit" className="btn">Log In</button>
                    <div className="sign-up">
                        <p>Don't have an account? &nbsp;</p>
                        <span><Link to="/signup">Sign Up</Link></span>
                    </div>
                </form>
            </div> 
            <DemoPopUp />
        </div>
    )
}

export default Login

// © 2025 Pitipat Pattamawilai. All Rights Reserved.