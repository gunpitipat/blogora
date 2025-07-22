import "./Navbar.css"
import clsx from "clsx"
import { useState } from "react"
import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from "../../contexts/AuthContext"
import { useMediaQuery } from "../../hooks/useMediaQuery";
import Tooltip from "../Tooltip/Tooltip";
import { FiMenu } from "react-icons/fi";

const Navbar = () => {
    // Tooltip for not logged-in users
    const [showTooltip, setShowTooltip] = useState(null)

    // Responsive navbar on mobile
    const [isOpen, setIsOpen] = useState(false)
    const isMobile = useMediaQuery("(max-width: 768px)")

    const { isAuthenticated, user, logout } = useAuthContext()
    const location = useLocation()

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

    const isLoggedIn = isAuthenticated && user?.username

    return (
        <>
            {/* Menu Icon shown only on mobile */}
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
                <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
            }
            
            {/* Navbar */}
            <nav className={`navbar ${isOpen ? "show-sidebar" : ""}`}>
                <ul>
                    <div className="menu-group">
                        <li className="nav-logo">
                            <Link to="/" onClick={handleLogoClick}>
                                <span className="former">
                                    BLOG
                                </span>
                                <span className="latter">
                                    ORA
                                </span>
                            </Link>
                        </li>

                        <li className={`menu ${location.pathname === "/explore" ? "selected" : ""}`}>
                            <Link to="/explore" onClick={() => setIsOpen(false)}>
                                Explore
                            </Link>
                        </li>

                        { isLoggedIn
                            ?   <li className={`menu ${location.pathname === "/create" ? "selected" : ""}`}>
                                     <Link to="/create" onClick={() => setIsOpen(false)}>
                                        Create Blog
                                    </Link>
                                </li>
                            :   <li className="menu disabled">
                                    <span onMouseEnter={() => setShowTooltip("create-blog")}
                                        onMouseLeave={() => setShowTooltip(null)}
                                    >
                                        <label>Create Blog</label>
                                        <Tooltip 
                                            showTooltip={showTooltip === "create-blog"}
                                            content={<p>Log in to create your own blog</p>}
                                            style={{ fontSize: "0.9rem", top: "120%", left: "50%" }}
                                            baseTransform="translateX(-50%) translateY(-8px)"
                                            activeTransform="translateX(-50%) translateY(0)"
                                            duration={0.3}
                                        />
                                    </span>
                                </li> 
                        }  

                        { isLoggedIn
                            ?   <li className={clsx("menu", 
                                    (user?.username && location.pathname.split("/")[2] === user?.username) && "selected" // Only mark selected if username exists and matches path
                                )}>
                                    <Link to={`/profile/${user.username}`} onClick={() => setIsOpen(false)}>
                                        Profile
                                    </Link>
                                </li>
                            :   <li className="menu disabled">
                                    <span onMouseEnter={() => setShowTooltip("profile")}
                                        onMouseLeave={() => setShowTooltip(null)}
                                    >
                                        <label>Profile</label>
                                        <Tooltip 
                                            showTooltip={showTooltip === "profile"}
                                            content={<p>Log in to manage your blogs</p>}
                                            style={{ fontSize: "0.9rem", top: "120%", left: "50%" }}
                                            baseTransform="translateX(-50%) translateY(-8px)"
                                            activeTransform="translateX(-50%) translateY(0)"
                                            duration={0.3}
                                        />
                                    </span>
                                </li>
                        }  
                    </div>

                    <div className="menu-group">
                        { !isLoggedIn
                            ?   <li className={`menu ${location.pathname === "/login" ? "selected" : ""}`}>
                                    <Link to="/login" onClick={() => setIsOpen(false)}>
                                        Log In
                                    </Link>
                                </li>
                            :   <li className="menu">
                                    <button onClick={handleLogout}>
                                        Log Out
                                    </button>
                                </li>
                        }
                    </div>
                </ul>
            </nav>
        </>
    )
}

export default Navbar

// © 2025 Pitipat Pattamawilai. All Rights Reserved.
