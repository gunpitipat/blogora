import "./Signup.css"
import api from "@/utils/api"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAlertContext } from "@/contexts/AlertContext"
import { useLoadingContext } from "@/contexts/LoadingContext"
import { FaEye, FaEyeSlash } from "react-icons/fa"

const Signup = () => {
    const [signupInputs, setSignupInputs] = useState({
        email: "",
        username: "",
        password: "",
        cfpassword: ""
    })
    const { email, username, password, cfpassword } = signupInputs

    let initialInputStatus = {
        email: { type: "", message: "" },
        username: { type: "", message: "" },
        password: { type: "", message: "" },
        cfpassword: { type: "", message: "" }
    }
    const [inputStatus, setInputStatus] = useState(initialInputStatus)
    const [showPassword, setShowPassword] = useState(false)
    const [showcfPassword, setShowcfPassword] = useState(false)

    const navigate = useNavigate()
    const { setLoading } = useLoadingContext()
    const { setAlertState } = useAlertContext()

    // Set input values to state
    const inputValues = inputName => event => {
        setSignupInputs({ ...signupInputs, [inputName]: event.target.value })
    }

    // Submit data
    const handleFormSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await api.post("/signup", { email, username, password, cfpassword })
            setSignupInputs({ email: "", username: "", password: "", cfpassword: "" })
            setInputStatus(initialInputStatus)
            setLoading(false)
            setAlertState({ display: true, type: "success", message: response.data.message })
            navigate("/login")            
            
        } catch (err) {
            // If the request completely fails (e.g., no internet, backend is unreachable)
            if (!err.response) {
                setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
            } else if (err.response.status === 500) {
                setAlertState({ display: true, type: "error", message: err.response.data?.message || "Server error. Please try again later." })
            } else {
                const { success, error } = err.response.data
            
                setInputStatus(prevState => {
                    let updatedStatus = { ...prevState } // Create a new object instead of directly modifying initialInputStatus variable
    
                    if (success && success.length > 0) {
                        success.forEach(element => {
                            updatedStatus[element] = { type: "success" }
                        })
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
                    <div className={`form-group ${inputStatus.email.type}`}>
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={inputValues("email")}
                            name="email"
                            autoComplete="email"
                            inputMode="email"
                        />
                        { inputStatus.email.type === "error" &&
                            <small>
                                {inputStatus.email.message}
                            </small>
                        }
                    </div>

                    <div className={`form-group ${inputStatus.username.type}`}>
                        <label>Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={inputValues("username")}
                            name="username"
                            autoComplete="username"
                            inputMode="text"
                        />
                        { inputStatus.username.type === "error" &&
                            <small>
                                {inputStatus.username.message}
                            </small>
                        }
                    </div>

                    <div className={`form-group ${inputStatus.password.type}`}>
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
                        { inputStatus.password.type === "error" &&
                            <small>
                                {inputStatus.password.message}
                            </small>
                        }
                    </div>

                    <div className={`form-group ${inputStatus.cfpassword.type}`}>
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
                        { inputStatus.cfpassword.type === "error" &&
                            <small>
                                {inputStatus.cfpassword.message}
                            </small>                        
                        }
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