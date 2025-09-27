import "./HeroSection.css"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "../../contexts/AuthContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import BubbleChat from "./BubbleChat";
import TryDemoButton from "./TryDemoButton";
import { FiArrowUpRight } from "react-icons/fi";
import { FaAngleDown } from "react-icons/fa6";
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollToPlugin, ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollToPlugin, ScrollTrigger)

const HeroSection = ({ isMobile }) => {
    const [hideScrollHint, setHideScrollHint] = useState(false)
    const isSmallScreen = useMediaQuery("(max-width: 550px)")
    const { isAuthenticated, user } = useAuthContext()
    const navigate = useNavigate()

    const isLoggedIn = isAuthenticated && user?.username

    useEffect(() => {
        setHideScrollHint(false) // React Router may not fully remount when re-entering, reusing the `true` value from last visit
    }, [])

    // Animate elements
    useGSAP(() => {
        gsap.from("#hero-headline", { opacity: 0, y: 15, duration: 0.8, ease: "power2.out" })
        gsap.from("#hero-subtitle", { opacity: 0, y: 15, duration: 1, delay: 0.2, ease: "power3.out" })
        gsap.from(".hero-cta", { opacity: 0, y: 20, duration: 0.8, ease: "power2.out" })
        gsap.from("#blogora-globe", { scale: 0.98, duration: 1.25, ease: "back.out(1)" })
        gsap.from("#orbit", { opacity: 0, duration: 0.5, ease: "power3.out" })
        gsap.from("#scroll-hint", { opacity: 0, duration: 1.75, delay: 1, ease: "power4.in" })
        ScrollTrigger.create({
            trigger: "#features-headline",
            start: "top 80%",
            onEnter: () => setHideScrollHint(true)
        })

        // Stagger each bubble-chat animation by 0.15s
        // In side-by-side and stacked layouts, the sequence is 1 -> 2 -> 4 -> 3 around the orbit
        // In shifted stacked layout (mobile), 1 -> 2 -> 3 -> 4 with repositioning to left curve
        const bubbleAnimations = [
            { selector: ".bubble-chat.first", x: 50, y: 50, delay: 0.3 },
            { selector: ".bubble-chat.second", x: isSmallScreen ? 50 : -50, y: 50, delay: 0.45 },
            { selector: ".bubble-chat.third", x: 50, y: -50, delay: isSmallScreen ? 0.6 : 0.75 }, 
            { selector: ".bubble-chat.fourth", x: isSmallScreen ? 50 : -50, y: -50, delay: isSmallScreen ? 0.75 : 0.6 }
        ]

        bubbleAnimations.forEach(({ selector, x, y, delay }) => {
            gsap.from(selector, {
                opacity: 0,
                x,
                y,
                scale: 0.75,
                duration: 0.5,
                delay,
                ease: "back.out(1)"
            })
        })
    }, [])

    const scrollToFeatures = () => {
        gsap.to(window, {
            duration: 1,
            scrollTo: "#features-section",
            ease: "power2.out"
        })
    }

    return (
        <section className="hero-section">
            <div className="container">
                <div className="hero-content">
                    <h1 className="hero-headline" id="hero-headline">
                        <span className="headline-lg">
                            Share ideas,{" "}
                            <span className="headline-lg-split"><br /></span>
                            Join the discussion,{" "}
                            <span className="headline-lg-split"><br /></span>
                            and Discover{" "}
                            <span className="headline-md-split"><br /></span>
                            new perspectives
                        </span>
                        <span className="headline-sm">
                            Share ideas and{" "}
                            <span className="headline-sm-split"><br /></span>
                            Join the discussion
                        </span>
                    </h1>
                    <p className={`hero-subtitle ${isLoggedIn ? "logged-in" : ""}`}
                        id="hero-subtitle"
                    >
                        { isLoggedIn
                            ?   <span>
                                    To get started with your own blog, just click below.
                                </span>
                            :   <span>
                                    To try the full experience, just click below
                                    <span className="subtitle-sm-hide">
                                        {" "}and explore instantly. No signup needed.
                                    </span>
                                </span>
                        }
                    </p>
                    <div className="hero-cta">
                        { isLoggedIn
                            ?   <button onClick={() => navigate("/create")}>
                                    Create Blog
                                </button>
                            :   <TryDemoButton /> 
                        }
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="globe-container">
                        <img src={`${process.env.PUBLIC_URL}/assets/images/blogora-globe.png`}
                            alt="blogora-globe" 
                            className="blogora-globe" 
                            id="blogora-globe" 
                        />
                        <div className="orbit" id="orbit">
                            <BubbleChat 
                                className="first" 
                                isMobile={isMobile} 
                                onClick={scrollToFeatures}
                            >
                                Learn the features
                            </BubbleChat>

                            <BubbleChat 
                                className="second link" 
                                isMobile={isMobile}
                            >
                                <a href="/blog/how-blogora-works" target="_blank" rel="noopener noreferrer">
                                    How Blogora works
                                    <span className="new-tab-icon">
                                        <FiArrowUpRight />
                                    </span>
                                </a>                                
                            </BubbleChat>

                            <BubbleChat 
                                className="third link" 
                                isMobile={isMobile}
                            >
                                <a href="/blog/behind-the-features-how-blogora-was-built" target="_blank" rel="noopener noreferrer">
                                    Behind the features
                                    <span className="new-tab-icon">
                                        <FiArrowUpRight />
                                    </span>
                                </a>                                
                            </BubbleChat>

                            <BubbleChat 
                                className="fourth link" 
                                isMobile={isMobile}
                            >
                                <a href="https://github.com/gunpitipat/blogora" target="_blank" rel="noopener noreferrer">
                                    View on GitHub
                                    <span className="new-tab-icon">
                                        <FiArrowUpRight />
                                    </span>
                                </a>
                            </BubbleChat>
                        </div>
                    </div>
                </div>
     
                <div className={`scroll-hint ${hideScrollHint ? "hide" : ""}`}
                    id="scroll-hint" 
                >
                    <span className="scroll-hint-icon">
                        <FaAngleDown />
                    </span>      
                </div>
            </div>
        </section>
    )
}

export default HeroSection

// © 2025 Pitipat Pattamawilai. All Rights Reserved.