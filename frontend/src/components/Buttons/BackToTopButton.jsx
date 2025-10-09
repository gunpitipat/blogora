import "./BackToTopButton.css"
import { useEffect, useState } from "react"
import { LuArrowUpToLine } from "react-icons/lu"

const BackToTopButton = () => {
    const [showButton, setShowButton] = useState(false)

    // Show/hide the button
    useEffect(() => {
        const handleButton = () => setShowButton(window.scrollY > 200)
        window.addEventListener("scroll", handleButton)
        return () => window.removeEventListener("scroll", handleButton)
    }, [])

    const backToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div className={`back-to-top-btn ${showButton ? "show" : ""}`} 
            onClick={backToTop} 
        >
            <LuArrowUpToLine />
        </div>
    )
}

export default BackToTopButton

// © 2025 Pitipat Pattamawilai. All Rights Reserved.