import "./FeatureSection.css"
import FeaturePanel from "./FeaturePanel"
import featureVideo1 from "../../assets/videos/blogora-feature-1.mp4"
import featureVideo2 from "../../assets/videos/blogora-feature-2.mp4"
import featureVideo3 from "../../assets/videos/blogora-feature-3.mp4"
import { lazyLoadVideos } from "../../utils/lazyVideoLoader"
import { useEffect } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/all"
gsap.registerPlugin(ScrollTrigger)

const FeatureSection = () => {

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

        // Horizontal scroll
        const panels = gsap.utils.toArray(".feature-panel")
        const videos = gsap.utils.toArray(".feature-panel video")
        const scrollDots = gsap.utils.toArray(".scroll-dot")
        const featureWrapper = document.querySelector(".feature-wrapper")
        const container = document.getElementById("feature-container")

        if (featureWrapper && container) {
            const horizontalDistance = featureWrapper.scrollWidth - container.offsetWidth // Full content width - visible viewport width
            container.style.marginBottom = horizontalDistance + "px" // Add vertical space for GSAP to finish the entire horizontal scroll

            let currentIndex = -1 // Track current visible panel
            let videoTimeout // Slight delay before playing/pausing video

            const playVideoAtIndex = (index) => {
                if (index === currentIndex) return // Avoid restarting if the panel index doesn't change
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

            gsap.to(".feature-wrapper", {
                x: () => -1 * horizontalDistance,
                ease: "none",
                scrollTrigger: {
                    id: "horizontal-scroll",
                    trigger: container,
                    start: "bottom bottom",
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

            // Briefly pause at the first and last panels on initial visit to prevent skipping the entire section
            let hasPausedAtStart = false

            ScrollTrigger.create({
                trigger: container,
                start: "bottom bottom",
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
    }, [])

    return (
        <section className="FeatureSection" id="feature-section">
            <div className="container" id="feature-container">
                <h2 id="feature-headline">
                    What you can do {" "}
                    <span className="headline-sm-split"><br /></span>
                    with{" "}
                    <span className="brandname">
                        Blogora
                    </span>
                </h2>
                <div id="feature-animate-in"> {/* For slide-in animation; separated from .feature-wrapper to avoid conflicting x-transitions with horizontal scroll */}
                    <div className="feature-wrapper">
                        <FeaturePanel 
                            dataSrc={featureVideo1}
                            subtitle={`Create Your Blog`}
                            bodyText={`Compose your thoughts and format your content with a rich text editor designed to help you express ideas clearly.`}
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
                    <span className="scroll-dot"></span>
                    <span className="scroll-dot"></span>
                    <span className="scroll-dot"></span>
                </div>
            </div>
        </section>
    )
}

export default FeatureSection

// © 2025 Pitipat Pattamawilai. All Rights Reserved.