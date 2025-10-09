import  "./QuickTipsSection.css"
import { useEffect, useRef, useState } from "react"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import QuickTipCard from "./QuickTipCard"
import { FaSearch, FaLink } from "react-icons/fa"
import { FaArrowPointer } from "react-icons/fa6"
import { LuUserRound } from "react-icons/lu"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/all"
gsap.registerPlugin(ScrollTrigger)

const QuickTipsSection = () => {
    const [showHint, setShowHint] = useState(false) // Control pointer hover animation toward the second card
    const pendingHideRef = useRef(false) // Defer hiding hover hint until the current cycle finishes
    const isDesktop = useMediaQuery("(min-width: 1200px)")

    useGSAP(() => {
        gsap.from("#quicktips-headline", { opacity: 0, y: 15, duration: 0.8, ease: "power2.out", 
            scrollTrigger: {
                trigger: "#quicktips-headline",
                start: "top 80%",
                toggleActions: "play none none none"
            }
        })
    }, [])

    useGSAP(() => {
        gsap.from(".quicktip-card-wrapper", { 
            opacity: 0, 
            x: isDesktop ? 0 : 40, 
            y: isDesktop ? 40 : 0, 
            duration: 0.75, 
            ease: "power2.out", 
            stagger: 0.15, 
            scrollTrigger: {
                trigger: "#quicktips-cards",
                start: "top 60%",
                toggleActions: "play none none none"
            },
            onStart: () => {
                if (isDesktop) gsap.set(".quicktip-card", { pointerEvents: "none" })
            },
            onComplete: () => {
                if (isDesktop) {
                    gsap.set(".quicktip-card", { pointerEvents: "auto" })
                    setShowHint(true)
                    return
                }

                // On mobile, playVideoAtIndex() could fire before GSAP animation finishes, causing the first video not to play
                const firstVideo = document.querySelectorAll(".quicktip-card video")[0]
                if (firstVideo && firstVideo.paused) {
                    firstVideo.currentTime = 0
                    firstVideo.play().catch(() => {})
                }
            }
        })
    }, [])
    // Edge case: If starting on desktop and resizing to mobile before entering this section,
    // the first video may not autoplay because useGSAP captures isDesktop on mount.
    // Unlikely scenario (users rarely resize mid-scroll and stay at that width),
    // and the impact is minor, so it's intentionally left as-is for simplicity.

    // Animate hover hint on desktop
    useEffect(() => { // useGSAP doesn't support cleanup
        if (!isDesktop || !showHint) return

        let cycleCount = 0

        const tl = gsap.timeline({
            repeat: -1,
            repeatDelay: 0.2,
            onRepeat: () => {
                cycleCount++
                if (cycleCount >= 1 && pendingHideRef.current) { // Ensure it plays at least once
                    setShowHint(false)
                    tl.kill()
                }
            }
        })

        tl.fromTo(".hover-hint", 
            { opacity: 0, x: 0, y: 0 },
            { opacity: 0.4, duration: 0.1, delay: 0.15, ease: "power2.out" } // Quick fade in
        )
        .to(".hover-hint", { x: -100, y: -50, duration: 1.4, ease: "sine.inOut" }) // Hover
        .to(".hover-hint", { opacity: 0.4, duration: 0.3 }) // Hang
        .to(".hover-hint", { opacity: 0, duration: 0.3, ease: "power2.out" }) // Fade out

        return () => tl.kill() // Prevent timeline from stacking up when switching between desktop and mobile
    }, [isDesktop, showHint])

    // Handle active card and video playback on mobile
    useEffect(() => {
        const cards = gsap.utils.toArray(".quicktip-card")
        const videos = gsap.utils.toArray(".quicktip-card video")

        if (isDesktop) {
            if (cards.length > 0) {
                cards.forEach(card => card.classList.remove("active")) // Reset active state when switching to desktop
            }
            if (videos.length > 0) {
                videos.forEach(video => {
                    video.pause()
                    video.currentTime = 0
                })
            }
            return
        }
        
        const viewportCenter = window.innerHeight / 2
        let videoTimeout
        let closestIndex = -1 // Set in checkIfCentered()
        let currentIndex = -1 // Set in playVideoAtIndex()
           
        const playVideoAtIndex = (index) => {
            if (!videos.length || index === currentIndex) return
            currentIndex = index

            clearTimeout(videoTimeout)
            videoTimeout = setTimeout(() => {
                videos.forEach((video, i) => {
                    if (i === index) {
                        if (video.paused) {
                            video.currentTime = 0
                            video.play().catch(() => {})
                        }
                    } else {
                        video.pause()
                        video.currentTime = 0
                    }
                })
            }, 300)
        }

        const checkIfCentered = () => {
            const section = document.querySelector(".quicktips-section")
            const sectionRect = section.getBoundingClientRect()
            let closestDistance = Infinity

            if (
                sectionRect.top > window.innerHeight || 
                sectionRect.bottom < window.innerHeight / 2 ||
                window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 5
            ) return
            
            cards.forEach((card, i) => {
                const cardRect = card.getBoundingClientRect()
                const cardCenter = cardRect.top + cardRect.height / 2
                const distance = Math.abs(cardCenter - viewportCenter)

                if (distance < closestDistance) {
                    closestDistance = distance
                    closestIndex = i
                }
            })

            cards.forEach((card, i) => {
                card.classList.toggle("active", i === closestIndex)
            })

            playVideoAtIndex(closestIndex)
        }

        window.addEventListener("scroll", checkIfCentered)
        checkIfCentered()

        return () => {
            window.removeEventListener("scroll", checkIfCentered)
            clearTimeout(videoTimeout)
        }
    }, [isDesktop])

    return (
        <section className="quicktips-section">
            <div className="container">
                <h2 className="quicktips-headline" id="quicktips-headline">
                    Quick Tips
                </h2>
                <div className="quicktips-cards" id="quicktips-cards">
                    <QuickTipCard 
                        poster="/assets/images/blogora-quicktip-1-poster.jpg"
                        dataSrc="/assets/videos/blogora-quicktip-1.mp4"
                        content={
                            <p>
                                To quickly <span>find blogs</span> that match your interests, use the search bar and type keywords in the title, content, or even an author's name.
                            </p>
                        }
                        icon={<FaSearch />}
                        isDesktop={isDesktop}
                        showHint={showHint}
                        pendingHideRef={pendingHideRef}
                    />
                    <QuickTipCard
                        poster="/assets/images/blogora-quicktip-2-poster.jpg"
                        dataSrc="/assets/videos/blogora-quicktip-2.mp4"
                        content={
                            <p>
                                Click an author's name to <span>visit</span> their <span>profile</span> and explore all the blogs they've published in one place.
                            </p>
                        }
                        icon={<LuUserRound strokeWidth={3.2} />}
                        isDesktop={isDesktop}
                        showHint={showHint}
                        pendingHideRef={pendingHideRef}
                    >
                        { isDesktop && showHint &&
                            <div className="hover-hint">
                                <FaArrowPointer />
                            </div>
                        }
                    </QuickTipCard>
                    <QuickTipCard
                        poster="/assets/images/blogora-quicktip-3-poster.jpg"
                        dataSrc="/assets/videos/blogora-quicktip-3.mp4"
                        content={
                            <p>
                                Use the link toggle tool with or without text selection to <span>insert, remove,</span> or <span>customize links</span> with optional display text.
                            </p>
                        }
                        icon={<FaLink />}
                        isDesktop={isDesktop}
                        showHint={showHint}
                        pendingHideRef={pendingHideRef}
                    />
                </div>
            </div>
        </section>
    )
}

export default QuickTipsSection

// © 2025 Pitipat Pattamawilai. All Rights Reserved.