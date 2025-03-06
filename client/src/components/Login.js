import "./Login.css"
import { Link, useNavigate, Navigate } from "react-router-dom"
import { useState } from "react"
import axios from "axios"
import { useAlertContext } from "../services/AlertContext"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLoadingContext } from "../services/LoadingContext"
import { useAuthContext } from "../services/AuthContext"
import LoadingScreen from "./LoadingScreen"

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

    // submit form
    const submitForm = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await axios.post(`${process.env.REACT_APP_API}/login`,
                { username, password },
                { withCredentials: true } // need to send the request with credentials to ensure that the cookie can be sent back from the backend and stored by the browser
            )
            await checkAuth() // ensures the token cookie is actually set and valid before updating the state.
            setUsername("")
            setPassword("")
            setErrorStatus(initialErrorStatus)
            setAlertState({ display: true, type: "success", message: response.data.message })
            setLoading(false)
            navigate("/")
        } catch (error) {
            const { message, field } = error.response.data
            setErrorStatus({ message, field })
            setLoading(false)
        }
    }

    if (loading) return <LoadingScreen />
    if (isAuthenticated && user) return <Navigate to="/" />

    return(
        <div className="Login">
            <div className="bg">
                <h2>Log In</h2>
                <form onSubmit={submitForm}>
                    <div className={errorStatus.field === "username" ? "showError" : null}>
                        <label>Username</label>
                        <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)}/>
                        <small>{errorStatus.message}</small>
                    </div>
                    <div className={errorStatus.field === "password" ? "showError" : null}>
                        <label>Password</label>
                        <div className="password-frame">
                            <input type={showPassword ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} id="password"/>
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
        </div>
    )
}

export default Login