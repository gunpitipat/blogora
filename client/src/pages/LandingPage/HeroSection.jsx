import "./HeroSection.css"
import axios from "axios"
import { useEffect, useState } from "react"
import { useAlertContext } from "../../contexts/AlertContext";
import { useDemoContext } from "../../contexts/DemoContext"
import { useAuthContext } from "../../contexts/AuthContext";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen"
import { useNavigate } from "react-router-dom"
import BlogoraGlobe from "../../assets/images/BlogoraGlobe.png"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { FiArrowUpRight } from "react-icons/fi";
import { FaAngleDown } from "react-icons/fa6";
import BubbleChat from "./BubbleChat";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { ScrollToPlugin, ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollToPlugin, ScrollTrigger)

const HeroSection = () => {
    const [tryDemoLoading, setTryDemoLoading] = useState(false)
    const [hideScrollHint, setHideScrollHint] = useState(false)
    const isMobile = useMediaQuery("(max-width: 550px)")

    const { setAlertState } = useAlertContext()
    const { setPrefillDemo, setShowDemoPopup } = useDemoContext()
    const { isAuthenticated, user } = useAuthContext()
    
    const navigate = useNavigate()

    const TTL_MINUTES_BEFORE_LOGIN = 15
    const LOGIN_BUFFER_MINUTES = 3
    
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

    const handleTryDemo = async () => {
        setTryDemoLoading(true)
        try {
            let demoCredentials = null
            let reuseCredentials = false

            try {
                demoCredentials = JSON.parse(localStorage.getItem("demoCredentials"))
                reuseCredentials = demoCredentials && 
                    Date.now() - demoCredentials.createdAt <= (TTL_MINUTES_BEFORE_LOGIN - LOGIN_BUFFER_MINUTES) * 60 * 1000
            } catch {
                localStorage.removeItem("demoCredentials") // In case of corrupted JSON
            }
            
            const response = await axios.post(`${process.env.REACT_APP_API}/demo/signup`,
                reuseCredentials 
                    ? { savedUsername: demoCredentials.username, savedPassword: demoCredentials.password }
                    : {}
            )

            const isSameUser = reuseCredentials && demoCredentials.username === response.data.username

            localStorage.setItem("demoCredentials", JSON.stringify({
                username: response.data.username,
                password: response.data.password,
                createdAt: isSameUser ? demoCredentials.createdAt : Date.now() // Timestamp to check for reuse
            }))

            setTryDemoLoading(false)
            setPrefillDemo(true)
            setShowDemoPopup(true)
            navigate("/login")

        } catch (error) {
            if (!error.response) {
                setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
            } else {
                setAlertState({ display: true, type: "error", message: error.response.data?.message || "Something went wrong. Please try again." })
            }
        } finally {
            setTryDemoLoading(false)
        }
    }

    // Animating elements
    useGSAP(() => {
        gsap.from("#hero-headline", { opacity: 0, y: 5, ease: "power2.out" })
        gsap.from("#hero-subtitle", { opacity: 0, y: 5, duration: 1, delay: 0.2, ease: "power3.out" })
        gsap.from(".btn", { opacity: 0, y: 8, ease: "power2.out" })
        // gsap.from("#blogora-globe", { scale: 0.97, duration: 1, ease: "power3.out" })
        gsap.from("#orbit", { opacity: 0, duration: 0.5, ease: "power3.out" })
        gsap.from("#scroll-hint", { opacity: 0, duration: 1.8, delay: 1.2, ease: "power4.in" })
        ScrollTrigger.create({
            trigger: "#feature-headline",
            start: "top 80%",
            onEnter: () => setHideScrollHint(true)
        })

        // Stagger each bubble-chat animation by 0.15s
        // In side-by-side and stacked layouts, the sequence is 1 -> 2 -> 4 -> 3 around the orbit
        // In shifted stacked layout (mobile), 1 -> 2 -> 3 -> 4 with repositioning to left curve
        const bubbleAnimations = [
            { selector: ".bubble-chat.first", x: 50, y: 50, delay: 0.3 },
            { selector: ".bubble-chat.second", x: isMobile ? 50 : -50, y: 50, delay: 0.45 },
            { selector: ".bubble-chat.third", x: 50, y: -50, delay: isMobile ? 0.6 : 0.75 }, 
            { selector: ".bubble-chat.fourth", x: isMobile ? 50 : -50, y: -50, delay: isMobile ? 0.75 : 0.6 }
        ]

        bubbleAnimations.forEach(({ selector, x, y, delay }) => {
            gsap.from(selector, {
                opacity: 0,
                x,
                y,
                scale: 0.75,
                duration: 0.5,
                delay,
                ease: "back.out(1.1)"
            })
        })
    }, [])

    const scrollToFeature = () => {
        gsap.to(window, {
            duration: 1,
            scrollTo: "#feature-section",
            ease: "power2.out"
        })
    }

    return (
        <section className="HeroSection">
            <div className="container">
                <div className="hero-content">
                    <h1 id="hero-headline">
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
                    <p id="hero-subtitle" className={(isAuthenticated && user?.username) ? "subtitle-logged-in" : ""}>
                        {(isAuthenticated && user?.username)
                        ? <span>
                            To get started with your own blog, just click below.
                          </span>
                        : <span>
                            To try the full experience, just click below
                            <span className="subtitle-sm-hide">{" "}and explore instantly. No signup needed.</span>
                          </span>
                        }
                    </p>
                    {(isAuthenticated && user?.username)
                    ? <button className="btn create-blog" onClick={()=>navigate("/create")}>Create Blog</button>
                    : <button className="btn try-demo" onClick={handleTryDemo}>Try Demo</button>  
                    }
                    {tryDemoLoading && <LoadingScreen />}
                </div>

                <div className="hero-visual">
                    <div className="globe-container">
                        <img src={BlogoraGlobe} alt="BlogoraGlobe" id="blogora-globe"/>
                        <div id="orbit">
                            <BubbleChat className="first" onClick={scrollToFeature}>
                                Learn the features
                            </BubbleChat>

                            <BubbleChat className="second">
                                See quick tips
                            </BubbleChat>

                            <BubbleChat className="third link">
                                <a href="/blog/how-blogora-works" target="_blank" rel="noopener noreferrer">
                                    How Blogora works
                                    <span className="new-tab">
                                        <FiArrowUpRight />
                                    </span>
                                </a>
                            </BubbleChat>

                            <BubbleChat className="fourth link">
                                <a href="https://github.com/gunpitipat/blogora" target="_blank" rel="noopener noreferrer">
                                    View on Github
                                    <span className="new-tab">
                                        <FiArrowUpRight />
                                    </span>
                                </a>
                            </BubbleChat>
                        </div>
                    </div>
                </div>
     
                <div id="scroll-hint" className={`${hideScrollHint ? "hide" : ""}`}>
                    <span>
                        <FaAngleDown />
                    </span>      
                </div>
            </div>
        </section>
    )
}

export default HeroSection

// © 2025 Pitipat Pattamawilai. All Rights Reserved.