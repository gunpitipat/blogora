import "./Signup.css"
import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAlertContext } from "../../contexts/AlertContext"
import { useLoadingContext } from "../../contexts/LoadingContext"
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = () => {
    const [signupInfo, setSignupInfo] = useState({
        email: "",
        username: "",
        password: "",
        cfpassword: ""
    })
    const { email, username, password, cfpassword } = signupInfo

    let initialInfoStatus = {
        email: { type: "", message: "" },
        username: { type: "", message: "" },
        password: { type: "", message: "" },
        cfpassword: { type: "", message: "" }
    }
    const [infoStatus, setInfoStatus] = useState(initialInfoStatus)
    const [showPassword, setShowPassword] = useState(false)
    const [showcfPassword, setShowcfPassword] = useState(false)

    const navigate = useNavigate()
    const { setLoading } = useLoadingContext()
    const { setAlertState } = useAlertContext()

    // Set input values to state
    const inputValues = inputName => event => {
        setSignupInfo({ ...signupInfo, [inputName]: event.target.value })
    }

    // Submit data
    const handleFormSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await axios.post(`${process.env.REACT_APP_API}/signup`, { email, username, password, cfpassword })
            setSignupInfo({ email: "", username: "", password: "", cfpassword: "" })
            setLoading(false)
            setAlertState({ display: true, type: "success", message: response.data.message })
            setInfoStatus(initialInfoStatus)
            navigate("/login")            
            
        } catch (err) {
            // If the request completely fails (e.g., no internet, backend is unreachable)
            if (!err.response) {
                setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
            } else if (err.response.status === 500) {
                setAlertState({ display: true, type: "error", message: err.response.data?.message || "Server error. Please try again later." })
            } else {
                const { success, error } = err.response.data
            
                setInfoStatus(prevState => {
                    let updatedStatus = { ...prevState } // Create a new object instead of directly modifying initialInfoStatus variable
    
                    if (success && success.length > 0) {
                        success.forEach(element => {
                            updatedStatus[element] = { type: "success" }
                        });
                    }
                    if (error && error.length > 0) {
                        error.forEach(element => {
                            updatedStatus[element.field] = { type: "error", message: element.message }
                        })
                    }
    
                    return updatedStatus // New object reference ensures React detects change
                })     
            }
        
        } finally {
            setLoading(false)
        }
    }        
        
    return(
        <div className="signup">
            <div className="container">
                <h2 className="headline">
                    Sign Up
                </h2>
                <form onSubmit={handleFormSubmit}>
                    <div className={`form-group ${infoStatus.email.type}`}>
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={inputValues("email")}
                            name="email"
                            autoComplete="email"
                            inputMode="email"
                        />
                        <small>
                            {infoStatus.email.type === "error" ? infoStatus.email.message : null}
                        </small>
                    </div>

                    <div className={`form-group ${infoStatus.username.type}`}>
                        <label>Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={inputValues("username")}
                            name="username"
                            autoComplete="username"
                            inputMode="text"
                        />
                        <small>
                            {infoStatus.username.type === "error" ? infoStatus.username.message : null}
                        </small>
                    </div>

                    <div className={`form-group ${infoStatus.password.type}`}>
                        <label>Password</label>
                        <div className="password-frame">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={inputValues("password")} 
                                autoComplete="new-password"
                                className="password-field"
                            />
                            <span className="password-icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </span>
                        </div>
                        <small>
                            {infoStatus.password.type === "error" ? infoStatus.password.message : null}
                        </small>
                    </div>

                    <div className={`form-group ${infoStatus.cfpassword.type}`}>
                        <label>Confirm Password</label>
                        <div className="password-frame">
                            <input 
                                type={showcfPassword ? "text" : "password"} 
                                value={cfpassword}
                                onChange={inputValues("cfpassword")} 
                                autoComplete="new-password"
                                className="password-field"
                            />
                            <span className="password-icon" onClick={() => setShowcfPassword(!showcfPassword)}>
                                {showcfPassword ? <FaEye /> : <FaEyeSlash />}
                            </span>
                        </div>
                        <small>
                            {infoStatus.cfpassword.type === "error" ? infoStatus.cfpassword.message : null}
                        </small>
                    </div>

                    <button type="submit" className="signup-btn">
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Signup

// © 2025 Pitipat Pattamawilai. All Rights Reserved.