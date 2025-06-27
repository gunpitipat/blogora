import "./Navbar.css"
import { Link, useLocation } from 'react-router-dom'
import { useState } from "react"
import { useAuthContext } from "../../contexts/AuthContext"
import { FiMenu } from "react-icons/fi";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const Navbar = () => {
    const location = useLocation()

    const { isAuthenticated, user, logout } = useAuthContext()

    // Tooltip for not logged-in users
    const [ showTooltip, setShowTooltip ] = useState(null)

    // Responsive navbar on mobile
    const [ isOpen, setIsOpen ] = useState(false)
    const isMobile = useMediaQuery("(max-width: 768px)")

    // Function to toggle Tooltip
    const toggleTooltip = (hoveredMenu) => {
        setShowTooltip(hoveredMenu)
    }

    // Handle brand logo click
    const handleLogoClick = () => {
        setIsOpen(false)
        if (location.pathname === "/") {
            window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top if already on landing page
        }
    }

    // Handle logout click
    const handleLogout = () => {
        setIsOpen(false) // Close sidebar on mobile
        logout()
    }

    return(
        <>
            {/* Show menu icon only on mobile and tablet */}
            { isMobile &&
                <div className={`menu-icon-overlay ${isOpen ? "hidden" : ""}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="menu-icon">
                        <FiMenu />
                    </div>
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
                        <li className="nav-logo">
                            <Link to="/" onClick={handleLogoClick}>
                                <span className="blog">BLOG</span><span className="ora">ORA</span>
                            </Link>
                        </li>
                        <li className={ location.pathname === "/explore" ? "selected" : null }>
                            <Link to="/explore" onClick={() => setIsOpen(false)}>Explore</Link>
                        </li>
                        <li className={ location.pathname === "/create" ? "selected" : null }>
                            { (isAuthenticated && user?.username) ? (
                                <Link to="/create" onClick={() => setIsOpen(false)}>Create Blog</Link>
                            ) : (
                                <span className="disable-menu"
                                    onMouseEnter={() => toggleTooltip("Create-Blog")}
                                    onMouseLeave={() => setShowTooltip(null)}
                                >
                                    <label>Create Blog</label>
                                    <div className={`tooltip ${showTooltip === "Create-Blog" ? "show" : ""}`}>
                                        <p>Log in to create your own blog</p>
                                    </div>
                                </span>
                            )}                    
                        </li>
                        <li className={((location.pathname.split("/")[2] === user?.username) && user?.username) ? "selected" : null }>
                            { (isAuthenticated && user?.username) ? (
                                <Link to={`/profile/${user.username}`} onClick={() => setIsOpen(false)}>Profile</Link>
                            ) : (
                                <span className="disable-menu"
                                    onMouseEnter={() => toggleTooltip("Profile")}
                                    onMouseLeave={() => setShowTooltip(null)}
                                >
                                    <label>Profile</label>
                                    <div className={`tooltip ${showTooltip === "Profile" ? "show" : ""}`}>
                                        <p>Log in to manage your blogs</p>
                                    </div>
                                </span>
                            )}
                        </li>
                    </div>
                    { !(isAuthenticated && user?.username) && (
                    <div className="menu-group">
                        <li className={ location.pathname === "/login" ? "selected" : null }>
                            <Link to="/login" onClick={() => setIsOpen(false)}>Log In</Link>
                        </li>
                    </div>)}
                    { (isAuthenticated && user?.username) && (
                    <div className="menu-group">
                        <li>
                            <span className="logout-menu" onClick={handleLogout}>
                                <button className="logout-btn">Log Out</button>
                            </span>
                        </li>
                    </div>)}
                </ul>
            </nav>
        </>
    )
}

export default Navbar

// © 2025 Pitipat Pattamawilai. All Rights Reserved.
