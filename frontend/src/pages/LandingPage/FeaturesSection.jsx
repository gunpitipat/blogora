import "./FeaturesSection.css"
import { useEffect, useRef } from "react"
import { debounce } from "lodash"
import FeaturePanel from "./FeaturePanel"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/all"
gsap.registerPlugin(ScrollTrigger)

const FeaturesSection = ({ isMobile }) => {
    const containerRef = useRef(null)
    const wrapperRef = useRef(null)

    useGSAP(() => {
        gsap.from("#features-headline", { opacity: 0, y: 15, duration: 0.8, ease: "power2.out", 
            scrollTrigger: {
                trigger: "#features-headline",
                start: "top 80%",
                toggleActions: "play none none none",
                onEnter: () => {
                    // Preload video 2 & 3
                    const videos = document.querySelectorAll(".feature-panel video")
                    videos.forEach((video, i) => {
                        if (i === 1 || i === 2) {
                            const src = video.dataset.src
                            if (src && !video.src) {
                                video.src = src
                                video.load()
                            }
                        }
                    })
                }
            }
        })
        gsap.from("#features-animate-in", { opacity: 0, x: 25, duration: 0.75, ease: "power2.out", 
            scrollTrigger: {
                trigger: "#features-animate-in",
                start: "top 60%",
                toggleActions: "play none none none"
            }
        })
    }, [])

    // Horizontal scroll
    useGSAP(() => {
        const featuresWrapper = wrapperRef.current
        const container = containerRef.current

        if (!featuresWrapper || !container) return

        const panels = gsap.utils.toArray(".feature-panel")
        const videos = gsap.utils.toArray(".feature-panel video")
        const scrollDots = gsap.utils.toArray(".scroll-dot")

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
            const horizontalDistance = featuresWrapper.scrollWidth - container.offsetWidth // Full content width - visible viewport width
            
            // Add vertical scroll space for GSAP to finish the full horizontal translation
            let spacer = container.nextElementSibling
            if (!spacer || !spacer.classList.contains("features-spacer")) {
                spacer = document.createElement("div")
                spacer.className = "features-spacer"
                spacer.style.width = "100%"
                spacer.style.pointerEvents = "none"
                container.insertAdjacentElement("afterend", spacer)
            }
            spacer.style.height = horizontalDistance + "px"
            
            gsap.to(featuresWrapper, {
                x: () => -1 * horizontalDistance,
                ease: "none",
                scrollTrigger: {
                    id: "horizontal-scroll",
                    trigger: container,
                    start: "center center",
                    end: () => "+=" + horizontalDistance,
                    pin: true,
                    pinSpacing: false,
                    invalidateOnRefresh: true,
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
                invalidateOnRefresh: true,
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

        // Responsiveness
        let prevWidth = featuresWrapper.scrollWidth

        const handleResize = debounce(() => {
            // Kill stale triggers
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger === container) trigger.kill()
            })
            // Recreate triggers
            setupScroll() 
            // Recalculate and update after layout changes
            requestAnimationFrame(() => ScrollTrigger.refresh())
        }, 300)

        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const newWidth = entry.target.scrollWidth
                if (newWidth !== prevWidth) {
                    handleResize()
                    prevWidth = newWidth
                }
            }
        })
        observer.observe(featuresWrapper)

        return () => {
            observer.disconnect()
            handleResize.cancel?.() // In case debounce is still pending
            clearTimeout(videoTimeout)
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger === container) trigger.kill()
            })
            // Killing triggers ("horizontal-scroll" and "pause-scroll") separately via ScrollTrigger.getById()?.kill() 
            // may not fully clean up GSAP's internal Observer, likely created due to snap, scrub, or pin behavior.
            // A leftover Observer can leak to other pages and cause auto-scroll issues.
            // To avoid this, I kill both triggers at once to ensure full cleanup.
            
            // Remove spacer element
            const spacer = container.nextElementSibling
            if (spacer && spacer.classList.contains("features-spacer")) spacer.remove()
        }
    }, [])

    // Hide navbar during horizontal scroll on laptop and desktop
    useEffect(() => {
        if (isMobile) return

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
    }, [isMobile])

    return (
        <section className="features-section" id="features-section">
            <div className="container" ref={containerRef}>
                <h2 className="features-headline" id="features-headline">
                    What you can do{" "}
                    <span className="headline-sm-split"><br /></span>
                    with{" "}
                    <span className="brandname">
                        Blogora
                    </span>
                </h2>
                
                <div id="features-animate-in"> {/* For slide-in animation; separated from .features-wrapper to avoid conflicting x-transitions with horizontal scroll */}
                    <div className="features-wrapper" ref={wrapperRef}>
                        <FeaturePanel 
                            isFirst
                            poster="/assets/images/blogora-feature-1-poster.jpg"
                            dataSrc="/assets/videos/blogora-feature-1.mp4"
                            subtitle={`Create Your Blog`}
                            bodyText={`Compose your thoughts and format your content with a rich text editor designed to help you express ideas freely whether by making your blog more structured, adding your style, or keeping it simple.`}
                        />
                        <FeaturePanel
                            poster="/assets/images/blogora-feature-2-poster.jpg"
                            dataSrc="/assets/videos/blogora-feature-2.mp4"
                            subtitle={`Live Preview`}
                            bodyText={`See exactly how your blog will look when published. With real-time updates, your edits are instantly reflected as you write, making it easy to fine-tune layout and content.`}
                        />
                        <FeaturePanel
                            poster="/assets/images/blogora-feature-3-poster.jpg"
                            dataSrc="/assets/videos/blogora-feature-3.mp4"
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

export default FeaturesSection

// © 2025 Pitipat Pattamawilai. All Rights Reserved.