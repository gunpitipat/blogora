import "./LandingPage.css"
import HeroSection from "./HeroSection";
import FeatureSection from "./FeatureSection";
import { useEffect } from "react";
import QuickTipSection from "./QuickTipSection";

const LandingPage = () => {
    // Reset scroll to top - when navigating from Explore, React Router's <Link> may preserve scroll position and carry it over to the landing page
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="LandingPage">
            <HeroSection />
            <FeatureSection />
            <QuickTipSection />
        </div>
    )
}

export default LandingPage

// © 2025 Pitipat Pattamawilai. All Rights Reserved.