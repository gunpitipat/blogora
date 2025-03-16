import { useState } from "react"
import "./SignUp.css"
import axios from "axios"
import { useAlertContext } from "../services/AlertContext"
import { useNavigate } from "react-router-dom"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLoadingContext } from "../services/LoadingContext"

const SignUp = () => {

    const [ signUpInfo, setSignUpInfo ] = useState({
        email: "",
        username: "",
        password: "",
        cfpassword: ""
    })
    const { email, username, password, cfpassword } = signUpInfo

    let initialInfoStatus = {
        email: { type: "", message: "" },
        username: { type: "", message: "" },
        password: { type: "", message: "" },
        cfpassword: { type: "", message: "" }
    }
    const [ infoStatus, setInfoStatus ] = useState(initialInfoStatus)

    const [ showPassword, setShowPassword ] = useState(false)
    const [ showcfPassword, setShowcfPassword ] = useState(false)

    const navigate = useNavigate()

    const { setLoading } = useLoadingContext()

    // Set input values to state
    const inputValues = inputName => event => {
        setSignUpInfo({ ...signUpInfo, [inputName]: event.target.value })
    }

    // Alert popup
    const { setAlertState } = useAlertContext()

    // Submit form 
    const submitForm = (e) => {
        e.preventDefault()
        setLoading(true)
        axios.post(`${process.env.REACT_APP_API}/signup`, { email, username, password, cfpassword })
        .then(response => {
            setSignUpInfo({ email: "", username: "", password: "", cfpassword: "" })
            setAlertState({ display: true, type: "success", message: response.data.message })
            setInfoStatus(initialInfoStatus)
            setLoading(false)
            navigate("/login")
        })
        .catch(err => {
            // If the request completely fails (e.g., no internet, backend is unreachable)
            if (!err.response) {
                setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
                return
            } else if (err.response.status === 500) {
                setAlertState({ display: true, type: "error", message: err.response.data.message || "Server error. Please try again later." })
                return
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
            setLoading(false)
        })
    }

    return(
        <div className="SignUp">
            <div className="bg">
                <h2>Sign Up</h2>
                <form onSubmit={submitForm}>
                    <div className={infoStatus.email.type}>
                        <label>Email</label>
                        <input type="email" value={email} onChange={inputValues("email")}/>
                        <small>{infoStatus.email.type === "error" ? infoStatus.email.message : null}</small>
                    </div>
                    <div className={infoStatus.username.type}>
                        <label>Username</label>
                        <input type="text" value={username} onChange={inputValues("username")}/>
                        <small>{infoStatus.username.type === "error" ? infoStatus.username.message : null}</small>
                    </div>
                    <div className={infoStatus.password.type}>
                        <label>Password</label>
                        <div className="password-frame">
                            <input type={showPassword ? "text" : "password"} value={password} onChange={inputValues("password")} id="password"/>
                            <span className="password-icon" onClick={()=>setShowPassword(!showPassword)}>
                                {showPassword ? <FaEye/> : <FaEyeSlash/>}
                            </span>
                        </div>
                        <small>{infoStatus.password.type === "error" ? infoStatus.password.message : null}</small>
                    </div>
                    <div className={infoStatus.cfpassword.type}>
                        <label>Confirm Password</label>
                        <div className="password-frame">
                            <input type={showcfPassword ? "text" : "password"} value={cfpassword} onChange={inputValues("cfpassword")} id="cfpassword"/>
                            <span className="password-icon" onClick={()=>setShowcfPassword(!showcfPassword)}>
                                {showcfPassword ? <FaEye/> : <FaEyeSlash/>}
                            </span>
                        </div>
                        <small>{infoStatus.cfpassword.type === "error" ? infoStatus.cfpassword.message : null}</small>
                    </div>
                    <button type="submit" className="btn">Sign Up</button>
                </form>
            </div>
        </div>
    )
}

export default SignUp

// © 2025 Pitipat Pattamawilai. All Rights Reserved.