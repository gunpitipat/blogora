import "./LandingPage.css"
import { useEffect, useState } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { lazyLoadVideos } from "../../utils/lazyVideoLoader"
import { TTL_MINUTES_BEFORE_LOGIN, LOGIN_BUFFER_MINUTES } from "../../utils/demoConstants";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import QuickTipsSection from "./QuickTipsSection";
import Reminder from "./Reminder"
import Footer from "../../components/Layout/Footer"
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen"

const LandingPage = () => {
    const [tryDemoLoading, setTryDemoLoading] = useState(false)
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
            { tryDemoLoading && <LoadingScreen /> }
            <HeroSection 
                isMobile={isMobile} 
                setTryDemoLoading={setTryDemoLoading} 
            />
            <FeaturesSection isMobile={isMobile} />
            <QuickTipsSection />
            <Reminder setTryDemoLoading={setTryDemoLoading} />
            <Footer />
        </div>
    )
}

export default LandingPage

// © 2025 Pitipat Pattamawilai. All Rights Reserved.