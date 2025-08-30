import "./SessionExpiration.css"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "../../contexts/AuthContext"
import { FaUserTimes } from "react-icons/fa";

const SessionExpiration = () => {
    const { 
        sessionExpired, 
        setSessionExpired, 
        setIsAuthenticated, 
        user, 
        setUser 
    } = useAuthContext()
    const navigate = useNavigate()
    
    const reAuthenticate = () => {
        localStorage.removeItem("isLoggedIn")
        setIsAuthenticated(false)
        setUser(null)
        setSessionExpired(false)
        navigate("/login")
    }

    // Save the user's last page, then restore it when the same user logs back in
    useEffect(() => {
        if (sessionExpired) {
            sessionStorage.setItem("lastPage", window.location.pathname)
            sessionStorage.setItem("username", user?.username)
        }
        // eslint-disable-next-line
    }, [sessionExpired])

    return (
        <div className="session-expiration">
            <div className={`modal-overlay ${sessionExpired ? "show" : ""}`}>
                <div className="modal-container">
                    <div className="icon-bg">
                        <FaUserTimes />
                    </div>
                    <h1 className="modal-title">
                        Session Expired
                    </h1>
                    <div className="modal-content">
                        <p>Your session has expired.&nbsp;</p>
                        <p>Please log in again.</p>
                    </div>
                    <div className="btn-container">
                        <button className="cancel-btn" onClick={() => setSessionExpired(false)}>
                            Dismiss
                        </button>
                        <button className="confirm-btn" onClick={reAuthenticate}>
                            Log in
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SessionExpiration

// © 2025 Pitipat Pattamawilai. All Rights Reserved.