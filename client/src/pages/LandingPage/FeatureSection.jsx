import "./FeatureSection.css"
import { useEffect, useRef } from "react"
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { lazyLoadVideos } from "../../utils/lazyVideoLoader"
import { debounce } from "lodash"
import FeaturePanel from "./FeaturePanel"
import featureVideo1 from "../../assets/videos/blogora_feature_1.mp4"
import featureVideo2 from "../../assets/videos/blogora_feature_2.mp4"
import featureVideo3 from "../../assets/videos/blogora_feature_3.mp4"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/all"
gsap.registerPlugin(ScrollTrigger)

const FeatureSection = () => {
    const containerRef = useRef(null)
    const wrapperRef = useRef(null)
    const isSmallScreen = useMediaQuery("(max-width: 768px)")

    useEffect(() => {
        lazyLoadVideos()
    }, [])

    useGSAP(() => {
        gsap.from("#feature-headline", { opacity: 0, y: 10, duration: 0.75, ease: "power2.out", 
            scrollTrigger: {
                trigger: "#feature-headline",
                start: "top 80%",
                toggleActions: "play none none none"
            }
        })
        gsap.from("#feature-animate-in", { opacity: 0, x: 25, duration: 0.75, ease: "power2.out", 
            scrollTrigger: {
                trigger: "#feature-animate-in",
                start: "top 60%",
                toggleActions: "play none none none"
            }
        })
    }, [])

    // Horizontal scroll
    useGSAP(() => {
        const panels = gsap.utils.toArray(".feature-panel")
        const videos = gsap.utils.toArray(".feature-panel video")
        const scrollDots = gsap.utils.toArray(".scroll-dot")
        const featureWrapper = wrapperRef.current
        const container = containerRef.current

        let currentIndex = -1 // Track current visible panel
        let videoTimeout // Slight delay before playing/pausing video
        let hasPausedAtStart = false

        const playVideoAtIndex = (index) => {
            if (!videos.length || index === currentIndex) return // Avoid restarting if the panel index doesn't change
            currentIndex = index

            clearTimeout(videoTimeout)
            videoTimeout = setTimeout(() => {
                videos.forEach((video, i) => {
                    // Play the one currently in view
                    if (i === index) {
                        if (video.paused) { // Prevent restarting if it's already playing
                            video.currentTime = 0
                            video.play().catch(() => {}) // catch autoplay errors (e.g. if paused too soon or not ready)
                        }
                    } else {
                        // Pause all other videos
                        video.pause()
                        video.currentTime = 0
                    }
                })
            }, 300)
        }

        const setupScroll = () => {
            if (!featureWrapper || !container) return

            const horizontalDistance = featureWrapper.scrollWidth - container.offsetWidth // Full content width - visible viewport width
            container.style.marginBottom = horizontalDistance + "px" // Add vertical scroll space for GSAP to finish the full horizontal animation

            gsap.to(".feature-wrapper", {
                x: () => -1 * horizontalDistance,
                ease: "none",
                scrollTrigger: {
                    id: "horizontal-scroll",
                    trigger: container,
                    start: "center center",
                    end: () => "+=" + horizontalDistance,
                    pin: true,
                    scrub: 0.5,
                    snap: {
                        snapTo: (progress) => {
                            const index = Math.round(progress * (panels.length - 1))
                            return index / (panels.length - 1)
                        },
                        duration: 1,
                        ease: "power2.out"
                    },
                    onUpdate: (self) => {
                        const index = Math.round(self.progress * (panels.length - 1))

                        // Scroll progress indicator
                        scrollDots.forEach((dot, i) => {
                            dot.classList.toggle("active", i === index)
                        })

                        // Restart and play video when in view
                        playVideoAtIndex(index)
                    }
                }
            })          

            // Briefly pause at first and last panels on initial visit to prevent skipping the entire section
            ScrollTrigger.create({
                id: "pause-scroll",
                trigger: container,
                start: "center center",
                end: () => "+=" + horizontalDistance,
                onEnter: () => {
                    if (hasPausedAtStart) return
                    hasPausedAtStart = true

                    document.body.style.overflow = "hidden"
                    setTimeout(() => {
                        document.body.style.overflow = ""
                    }, 500)
                },
                onUpdate: (self) => {
                    if (self.progress === 1 && !self.triggered) {
                        self.triggered = true
                        
                        document.body.style.overflow = "hidden"
                        setTimeout(() => {
                            document.body.style.overflow = ""
                        }, 500)
                    }
                }
            })
        }

        // Initial setup
        setupScroll()

        const handleResize = debounce(() => {
            // Kill stale triggers
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger === container) trigger.kill()
            })
            // Recreate triggers
            setupScroll() 
            // Recalculate and update everything after layout changes
            requestAnimationFrame(() => ScrollTrigger.refresh())
        }, 300)

        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
            handleResize.cancel?.() // In case debounce is still pending
            clearTimeout(videoTimeout)
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger === container) trigger.kill()
            })
            // Killing triggers ("horizontal-scroll" and "pause-scroll") separately via ScrollTrigger.getById()?.kill() 
            // may not fully clean up GSAP's internal Observer, likely created due to snap, scrub, or pin behavior.
            // A leftover Observer can leak to other pages and cause auto-scroll issues.
            // To avoid this, I kill both triggers at once to ensure full cleanup.
        }
    }, [])

    // Hide navbar during horizontal scroll on laptop and desktop
    useEffect(() => {
        if (isSmallScreen) return

        const checkIfCentered = () => {
            const navbar = document.querySelector(".navbar")
            const container = containerRef.current
            if (!navbar || !container) return

            const rect = container.getBoundingClientRect()
            const containerCenter = rect.top + rect.height / 2
            const viewportCenter = window.innerHeight / 2
            const threshold = 80

            if (Math.abs(containerCenter - viewportCenter) < threshold) { // Check how close the centers of container and viewport are to the threshold
                navbar.classList.add("hide")
            } else {
                navbar.classList.remove("hide")
            }
        }

        window.addEventListener("scroll", checkIfCentered)
        checkIfCentered()

        return () => {
            window.removeEventListener("scroll", checkIfCentered)
            // Ensure navbar is visible again if navigating away during horizontal scroll section
            document.querySelector(".navbar")?.classList.remove("hide")
        }
    }, [isSmallScreen])

    return (
        <section className="feature-section" id="feature-section">
            <div className="container" id="feature-container" ref={containerRef}>
                <h2 className="feature-headline" id="feature-headline">
                    What you can do{" "}
                    <span className="headline-sm-split"><br /></span>
                    with{" "}
                    <span className="brandname">
                        Blogora
                    </span>
                </h2>
                
                <div id="feature-animate-in"> {/* For slide-in animation; separated from .feature-wrapper to avoid conflicting x-transitions with horizontal scroll */}
                    <div className="feature-wrapper" ref={wrapperRef}>
                        <FeaturePanel 
                            isFirst
                            dataSrc={featureVideo1}
                            subtitle={`Create Your Blog`}
                            bodyText={`Compose your thoughts and format your content with a rich text editor designed to help you express ideas freely whether by making your blog more structured, adding your style, or keeping it simple.`}
                        />
                        <FeaturePanel
                            dataSrc={featureVideo2}
                            subtitle={`Live Preview`}
                            bodyText={`See exactly how your blog will look when published. With real-time updates, your edits are instantly reflected as you write, making it easy to fine-tune layout and content.`}
                        />
                        <FeaturePanel
                            dataSrc={featureVideo3}
                            subtitle={`Join the Conversation`}
                            bodyText={`Engage with others by commenting on blogs or replying to someone else. Whether you're sharing thoughts, asking questions, or continuing a discussion, it's a simple way to connect and exchange your ideas.`}
                        />
                    </div>
                </div>

                <div className="scroll-progress">
                    <span className="scroll-dot active" />
                    <span className="scroll-dot" />
                    <span className="scroll-dot" />
                </div>
            </div>
        </section>
    )
}

export default FeatureSection

// © 2025 Pitipat Pattamawilai. All Rights Reserved.