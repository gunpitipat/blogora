import { useEffect } from "react"
import { useLocation } from "react-router-dom"

// Reset scroll to top on navigation - React Router preserves scroll position between route changes, 
// which can cause GSAP to skip scroll-based animations if it thinks scroll is already past trigger points.
// Calling window.scrollTo(0, 0) at a higher level (e.g. Layout.jsx) ensures it resets early enough for GSAP.

const ScrollToTop = () => {
    const location = useLocation()

    useEffect(() => {
        if (location.pathname !== "/explore") { // Allow scroll restoration on Explore
            window.scrollTo(0, 0)
        }
    }, [location.pathname])

    return null
}

export default ScrollToTop

// © 2025 Pitipat Pattamawilai. All Rights Reserved.