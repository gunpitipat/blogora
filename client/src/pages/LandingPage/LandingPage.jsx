import "./LandingPage.css"
import { useEffect } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { lazyLoadVideos } from "../../utils/lazyVideoLoader"
import { TTL_MINUTES_BEFORE_LOGIN, LOGIN_BUFFER_MINUTES } from "../../utils/demoConstants";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import QuickTipsSection from "./QuickTipsSection";
import Reminder from "./Reminder"
import Footer from "../../components/Layout/Footer"

const LandingPage = () => {
    const isMobile = useMediaQuery("(max-width: 768px)")

    useEffect(() => {
        lazyLoadVideos()
    }, [])

    // Cleanup demoCrendentials in localStorage
    useEffect(() => {
        try {
            const demoCredentials = JSON.parse(localStorage.getItem("demoCredentials"))
            if (!demoCredentials) return

            // If a user clicked 'Try Demo' and never logs in
            if (Date.now() - demoCredentials.createdAt > (TTL_MINUTES_BEFORE_LOGIN - LOGIN_BUFFER_MINUTES) * 60 * 1000) {
                localStorage.removeItem("demoCredentials")
            }
        
        } catch (error) {
            // In case of corrupted JSON, clean it up
            localStorage.removeItem("demoCredentials")
        }
    }, [])

    return (
        <div className="landing-page">
            <HeroSection isMobile={isMobile} />
            <FeaturesSection isMobile={isMobile} />
            <QuickTipsSection />
            <Reminder />
            <Footer />
        </div>
    )
}

export default LandingPage

// © 2025 Pitipat Pattamawilai. All Rights Reserved.