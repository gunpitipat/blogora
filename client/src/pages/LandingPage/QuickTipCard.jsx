import { useRef } from "react"

const QuickTipCard = ({ 
    children,
    dataSrc, 
    content, 
    icon, 
    isDesktop, 
    showHint, 
    pendingHideRef,
}) => {
    const cardRef = useRef(null)
    const videoRef = useRef(null)
    
    // Handle active card and video playback on desktop
    const handleOnMouseEnter = () => {
        const card = cardRef.current
        const video = videoRef.current

        if (!isDesktop || !card || !video) return

        card.classList.add("active")
        if (video.paused) {
            video.currentTime = 0
            video.play().catch(() => {})
        }

        if (showHint) pendingHideRef.current = true // Hide hover hint permanently after the first hover
    }

    const handleOnMouseLeave = () => {
        const card = cardRef.current
        const video = videoRef.current

        if (!isDesktop || !card || !video) return
        
        card.classList.remove("active")
        video.pause()
        video.currentTime = 0
    }

    return (
        <div className="quicktip-card-wrapper"> {/* For GSAP animation */}
            <div className="quicktip-card"
                ref={cardRef}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
            >
                <div className="card-visual">
                    <video
                        ref={videoRef}
                        muted loop playsInline
                        preload="metadata" data-src={dataSrc} // For lazy loading
                    >
                        <source type="video/mp4" />
                        Your browser does not support the video tag.                    
                    </video>
                </div>

                <div className="card-content">
                    {content}
                </div>

                <div className="card-icon">
                    {icon}
                </div>

                {children}
            </div>
        </div>
    )
}

export default QuickTipCard

// © 2025 Pitipat Pattamawilai. All Rights Reserved.