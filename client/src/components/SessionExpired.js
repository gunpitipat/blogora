import { useEffect } from "react";
import { useAuthContext } from "../utils/AuthContext"
import "./SessionExpired.css"
import { FaUserTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom"

const SessionExpired = () => {
    const { sessionExpired, setSessionExpired, setIsAuthenticated, user, setUser } = useAuthContext()
    const navigate = useNavigate()
    
    const reAuthenticate = () => {
        setIsAuthenticated(false)
        setUser(null)
        setSessionExpired(false)
        localStorage.removeItem("isLogin")
        navigate("/login")
    }

    // Save the user's draft, preventing losing user content, then restore it when they log back in
    useEffect(() => {
        if (sessionExpired) {
            sessionStorage.setItem("lastPage", window.location.pathname)
            sessionStorage.setItem("username", user?.username)
        }
        // eslint-disable-next-line
    }, [sessionExpired])

    return (
        <div className="SessionExpired">
            <div className={`modal-overlay ${sessionExpired ? "show" : ""}`}>
                <div className="confirm-container">
                    <div className="icon-background"><FaUserTimes /></div>
                    <h1>Session Expired</h1>
                    <div className="content">
                        <p>Your session has expired.&nbsp;</p>
                        <p>Please log in again.</p>
                    </div>
                    <div className="button-container">
                        <button onClick={()=>setSessionExpired(false)} className="cancel-button">Dismiss</button>
                        <button onClick={reAuthenticate} className="confirm-button">Log in</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SessionExpired

// © 2025 Pitipat Pattamawilai. All Rights Reserved.