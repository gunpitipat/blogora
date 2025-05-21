import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useLoadingContext } from "./LoadingContext"
import { useAlertContext } from "../contexts/AlertContext";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext()

export const useAuthContext = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null) // Initially null -> shows loading screen in protected routes
    const [user, setUser] = useState(null)
    const [sessionExpired, setSessionExpired] = useState(false)
    const loggingOutRef = useRef(false)
    const navigate = useNavigate()

    const { setLoading } = useLoadingContext()

    const { setAlertState } = useAlertContext()

    const checkAuth = useCallback(
        async () => {
            setLoading(true)
            try {
                const response = await axios.get(`${process.env.REACT_APP_API}/check-auth`, {
                    withCredentials: true, // Sends cookies with request
                })
                setIsAuthenticated(response.data.isAuthenticated)
                setUser({ username: response.data.username, role: response.data.role })

            } catch (error) {
                setIsAuthenticated(false)
                setUser(null)
            } finally {
                setLoading(false)
            }
        },
        // eslint-disable-next-line
        []
    )
    
    useEffect(() => {
        checkAuth() // Checking if the session is still valid once the app loads or is refreshed
        // eslint-disable-next-line
    }, [])

    // Axios interceptor to redirect on session expiration
    useEffect(() => {
        const responseInterceptor = axios.interceptors.response.use(
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

        return () => {
            axios.interceptors.response.eject(responseInterceptor) // Cleanup on unmount
        }
        // eslint-disable-next-line
    }, [isAuthenticated])

    // Logout
    const logout = async () => {
        setLoading(true)
        try {
            loggingOutRef.current = true // Prevent session expiration modal from appearing
            const response = await axios.post(`${process.env.REACT_APP_API}/logout`, {}, { withCredentials: true })
            localStorage.removeItem("isLogin")
            await checkAuth()
            loggingOutRef.current = false
            setLoading(false)
            setAlertState({ display: true, type: "success", message: response.data.message })
            setTimeout(() => {
                navigate("/login")
            }, 0)
        } catch (error) {
            setLoading(false)
            setAlertState({ display: true, type: "error", message: "Something went wrong. Please try again." })
        }
    }

    // Restore last page after login if session expired
    useEffect(() => {
        if (isAuthenticated && user?.username) {
            const lastUser = sessionStorage.getItem("username")
            const lastPage = sessionStorage.getItem("lastPage")
            if (user?.username === lastUser) {
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

        if (localStorage.getItem("isLogin") && !isAuthenticated) {
            setAlertState({ display: true, type: "error", message: "Your session expired." })
            localStorage.removeItem("isLogin")
        }
        // eslint-disable-next-line
    }, [isAuthenticated])

    return ( // When using user.username as a condition for rendering UI, use optional chaining (user?.username) to prevent errors where user might be null or undefined initially
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser, checkAuth, sessionExpired, setSessionExpired, logout }}>
            {children}
        </AuthContext.Provider>
    ) 
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.