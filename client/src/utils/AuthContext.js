import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useLoadingContext } from "./LoadingContext"

const AuthContext = createContext()

export const useAuthContext = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null) // Initially null -> shows loading screen in protected routes
    const [user, setUser] = useState(null)

    const { setLoading } = useLoadingContext()

    const checkAuth = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${process.env.REACT_APP_API}/check-auth`, {
                withCredentials: true, // Sends cookies with request
                validateStatus: () => true, // Prevents axios from throwing HTTP errors on non-2xx responses (allow all status codes to go to .then() block to manually handle errors)
            })
            if (res.status === 200) {
                setIsAuthenticated(res.data.isAuthenticated)
                setUser({ username: res.data.username, role: res.data.role })
            } else {
                setIsAuthenticated(res.data.isAuthenticated) // or setIsAuthenticated(false)
                setUser(null)
            }
        } catch (error) { // Real network issues where axios never receives a response still go to catch block
            setIsAuthenticated(false)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const attachInterceptors = () => {      
        axios.defaults.baseURL = process.env.REACT_APP_API
        axios.defaults.withCredentials = true// Ensures cookies are sent with requests
      
        axios.interceptors.response.use(
          (response) => response, // Allow successful responses to pass through
          (error) => {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
              setIsAuthenticated(false)
              setUser(null)
            }
            return Promise.reject(error)
          }
        )
      }
    
    // Prevent isAuthenticated and user from being lost when refreshing the page
    useEffect(() => {
        attachInterceptors()
        checkAuth() // Checking if the session is still valid once the app loads
        // eslint-disable-next-line
    }, [])

    return ( // When using user.username as a condition for rendering UI, use optional chaining (user?.username) to prevent errors where user might be null or undefined initially
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser, checkAuth }}>
            {children}
        </AuthContext.Provider>
    ) 
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.