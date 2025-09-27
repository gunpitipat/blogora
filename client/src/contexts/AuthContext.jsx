import api from "../utils/api"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAlertContext } from "../contexts/AlertContext";
import { useLoadingContext } from "./LoadingContext"

const AuthContext = createContext()

export const useAuthContext = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [isAuthChecked, setIsAuthChecked] = useState(false) // Flag to indicate whether initial auth check has completed before showing UI
    const [isAuthenticated, setIsAuthenticated] = useState(null)
    const [user, setUser] = useState(null)
    const [sessionExpired, setSessionExpired] = useState(false)
    const loggingOutRef = useRef(false)

    const navigate = useNavigate()
    const { setLoading } = useLoadingContext()
    const { setAlertState } = useAlertContext()

    const checkAuth = useCallback(async () => {
        try {
            const response = await api.get("/check-auth")
            setIsAuthenticated(response.data.isAuthenticated)
            setUser({ username: response.data.username, role: response.data.role })

        } catch (error) {
            setIsAuthenticated(false)
            setUser(null)
        }
        // eslint-disable-next-line
    }, [])
    
    // Check if the session is still valid once the app loads or is refreshed
    useEffect(() => {
        (async () => {
            await checkAuth()
            setIsAuthChecked(true)
        })()
        // eslint-disable-next-line
    }, [])

    // Axios interceptor to redirect on session expiration
    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            (response) => response, // Pass successful response through
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    if (isAuthenticated && !loggingOutRef.current) {
                        // Show SessionExpiration Modal when the user was authenticated and session expired, not when manually logged out
                        setSessionExpired(true)
                    }
                }
                return Promise.reject(error) // The error reaches catch block of the specific protected action's API call (not checkAuth())
            }
        )

        return () => api.interceptors.response.eject(responseInterceptor) // Cleanup on unmount
        // eslint-disable-next-line
    }, [isAuthenticated])

    // Logout
    const logout = async () => {
        setLoading(true)
        try {
            loggingOutRef.current = true // Prevent session expiration modal from appearing
            const response = await api.post("/logout", {})
            localStorage.removeItem("isLoggedIn")
            await checkAuth()
            loggingOutRef.current = false
            setLoading(false)
            setAlertState({ display: true, type: "success", message: response.data.message })
            setTimeout(() => {
                navigate("/login")
            }, 0)
            
        } catch (error) {
            setAlertState({ display: true, type: "error", message: "Something went wrong. Please try again." })
        
        } finally {
            setLoading(false)
        }
    }

    // Restore last page after login if session expired
    useEffect(() => {
        if (isAuthenticated && user?.username) {
            const lastUser = sessionStorage.getItem("username")
            const lastPage = sessionStorage.getItem("lastPage")
            
            if (lastUser && lastPage && user?.username === lastUser) {
                setTimeout(() => {
                    navigate(lastPage)
                    sessionStorage.removeItem("username") // Clear after restoring for the correct user
                    sessionStorage.removeItem("lastPage")    
                }, 0) // Delay for isAuthenticated and user to be updated. Otherwise, if lastPage was in ProtectedRoute, it would redirect to login and then force navigation to /explore.
            }
        }
        // eslint-disable-next-line
    }, [isAuthenticated, user])

    // Alert a user when their session expired and they refresh or reload the page
    useEffect(() => {
        // Avoid alerting if isAuthenticated is being initialized and not updated yet
        if (isAuthenticated === null) return

        if (localStorage.getItem("isLoggedIn") && !isAuthenticated) {
            setAlertState({ display: true, type: "error", message: "Your session expired." })
            localStorage.removeItem("isLoggedIn")
        }
        // eslint-disable-next-line
    }, [isAuthenticated])

    return ( // NOTE: When using user.username as a condition for rendering UI, use optional chaining (user?.username) to prevent errors where user might be null or undefined initially
        <AuthContext.Provider value={{ 
            isAuthChecked,
            isAuthenticated, 
            setIsAuthenticated, 
            user, 
            setUser, 
            checkAuth, 
            sessionExpired, 
            setSessionExpired, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    ) 
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.