import "./Navbar.css"
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from "react"
import { useAuthContext } from "../services/AuthContext"
import axios from "axios"
import { useAlertContext } from "../services/AlertContext"
import { FiMenu } from "react-icons/fi";

const Navbar = () => {
    const location = useLocation()
    const [pathname, setPathname] = useState(location.pathname)

    const { isAuthenticated, user, checkAuth } = useAuthContext()

    const { setAlertState } = useAlertContext()

    // ToolTip for not logged in users
    const [ showToolTip, setShowToopTip ] = useState(null)

    // Responsive navbar on mobile
    const [ isOpen, setIsOpen ] = useState(false)
    const [ isMobile, setIsMobile ] = useState(window.innerWidth <= 768)
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        window.addEventListener("resize", handleResize) // listens for window resize events and updates isMobile dynamically
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        setPathname(location.pathname)
    }, [location])

    // Logout
    const logout = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API}/logout`, {}, { withCredentials: true })
            await checkAuth()
            setAlertState({ display: true, type: "success", message: response.data.message })
        } catch (error) {
            console.error(error)
        }
    }

    // Function to toggle ToolTip
    const toggleToolTip = (hoveredMenu) => {
        setShowToopTip(hoveredMenu)
    }

    return(
        <>
            {/* Show menu icon only on mobile screen */}
            { isMobile &&
                <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
                    <FiMenu />
                </div>
            }
            {/* Overlay to close sidebar when clicking outside */}
            { isOpen &&
                <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>
            }
            
            {/* Navbar by default (laptop and desktop) */}
            <nav className={`Navbar ${isOpen ? "show-sidebar" : ""}`}>
                <ul>
                    <div className="menu-group">
                        <li className={ pathname === "/" ? "selected" : null }>
                            <Link to="/" onClick={() => setIsOpen(false)}>Community</Link>
                        </li>
                        <li className={ pathname === "/create" ? "selected" : null }>
                            { (isAuthenticated && user) ? (
                                <Link to="/create" onClick={() => setIsOpen(false)}>Create Blog</Link>
                            ) : (
                                <span className="disable-menu"
                                    onMouseEnter={() => toggleToolTip("Create-Blog")}
                                    onMouseLeave={() => setShowToopTip(null)}
                                >
                                    <label>Create Blog</label>
                                    <div className={`tooltip ${showToolTip === "Create-Blog" ? "show" : ""}`}>
                                        <p>Log in to create your own blog</p>
                                    </div>
                                </span>
                            )}                    
                        </li>
                        <li className={ pathname.includes("/profile") ? "selected" : null }>
                            { (isAuthenticated && user) ? (
                                <Link to={`/profile/${user}`} onClick={() => setIsOpen(false)}>Profile</Link>
                            ) : (
                                <span className="disable-menu"
                                    onMouseEnter={() => toggleToolTip("Profile")}
                                    onMouseLeave={() => setShowToopTip(null)}
                                >
                                    <label>Profile</label>
                                    <div className={`tooltip ${showToolTip === "Profile" ? "show" : ""}`}>
                                        <p>Log in to manage your blogs</p>
                                    </div>
                                </span>
                            )}
                        </li>
                    </div>
                    { !(isAuthenticated && user) && (
                    <div className="menu-group">
                        <li className={ pathname === "/login" ? "selected" : null }>
                            <Link to="/login" onClick={() => setIsOpen(false)}>Log In</Link>
                        </li>
                    </div>)}
                    { (isAuthenticated && user) && (
                    <div className="menu-group">
                        <li>
                            <Link to="/" onClick={() => setIsOpen(false)}>
                                <button className="logout-btn" onClick={logout}>
                                    Log Out
                                </button>
                            </Link>
                        </li>
                    </div>)}
                </ul>
            </nav>
        </>
    )
}

export default Navbar

// © 2025 Pitipat Pattamawilai. All Rights Reserved.
