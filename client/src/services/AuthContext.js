import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useLoadingContext } from "./LoadingContext"

const AuthContext = createContext()

export const useAuthContext = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null) // initially null => shows loading screen in protected routes
    const [user, setUser] = useState(null)

    const { setLoading } = useLoadingContext()

    const checkAuth = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${process.env.REACT_APP_API}/check-auth`, {
                withCredentials: true, // sends cookies with request
                validateStatus: () => true, // prevents axios from throwing HTTP errors on non-2xx responses (allow all status codes to go to .then() block to manually handle errors)
            })
            if (res.status === 200) {
                setIsAuthenticated(res.data.isAuthenticated)
                setUser(res.data.username)
            } else {
                setIsAuthenticated(res.data.isAuthenticated) // or setIsAuthenticated(false)
                setUser(null)
            }
        } catch (error) { // real network issues where axios never receives a response still go to catch block
            setIsAuthenticated(false)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }
    
    // When a user refreshes the page, React state resets, so isAuthenticated and user would be lost.
    // useEffect ensures that checkAuth() runs once when the app loads, checking if the session is still valid.
    useEffect(() => {
        checkAuth()
        // eslint-disable-next-line
    }, [])

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser, checkAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.