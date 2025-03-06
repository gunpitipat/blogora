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

    // set input values to state
    const inputValues = inputName => event => {
        setSignUpInfo({ ...signUpInfo, [inputName]: event.target.value })
    }

    // alert popup
    const { setAlertState } = useAlertContext()

    // submit form 
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
            const { success, error } = err.response.data
            if (success && success.length > 0) {
                // กรณีทุก field กรอกข้อมูลถูกหมด แต่ชื่อ user ซ้ำ err.response.data จะมีแค่ error ไม่มี success จึงต้องเพิ่มเงื่อนไข if(success) เข้าไป และ error จะมี value ค่าเดียวเป็น string ดูจาก userController.js ซึ่ง error.forEach จะใช้ไม่ได้กับ string
                success.forEach(element => {
                    initialInfoStatus[element] = { type: "success" }
                });
            }
            if (typeof error !== "string") {
                error.forEach(element => {
                initialInfoStatus[element.field] = { type: "error", message: element.message }
                })
            }
            if(typeof error === "string"){// in case username has been used (more info at userController.js)
                setAlertState({ display: true, type: "error", message: error })
            }
            setInfoStatus(initialInfoStatus)
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