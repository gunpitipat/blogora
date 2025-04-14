import "./BlogSnippet.css"
import { Link, useLocation } from "react-router-dom"
import { extractSubsections } from "../utils/contentUtils"
import { formatDayMonth } from "../utils/formatDateUtils";
import { getLineHeight } from "../utils/layoutUtils";
import { useEffect, useMemo, useRef, useState } from "react"
import { debounce } from "lodash"

const BlogSnippet = (props) => {
    const { blog, disableInnerLink } = props
    const contentRef = useRef(null)
    const [isOverflowing, setIsOverflowing] = useState(false)

    // Profile page usage
    const location = useLocation()
    const titleRef = useRef(null)

    const sections = useMemo(() => {
        return extractSubsections(blog.content)
    }, [blog.content])

    useEffect(() => {
        const checkOverflowing = () => {
            if (contentRef.current) {
                const { scrollHeight, clientHeight } = contentRef.current
                setIsOverflowing(scrollHeight > clientHeight)
            }
        }
        checkOverflowing()
        window.addEventListener("resize", checkOverflowing)

        return () => window.removeEventListener("resize", checkOverflowing)
    }, [blog])

    // Fix uneven BlogSnippet heights in two-column layout on Profile page
    useEffect(() => {
        const updateMaxHeight = () => {
            const isProfilePage = location.pathname.split("/")[1] === "profile"
            const isWideScreen = window.innerWidth >= 1024 // Two-column breakpoint

            if (!isProfilePage || !isWideScreen || !titleRef.current || !contentRef.current) {
                return
            }
            
            const titleLineHeight = getLineHeight(titleRef.current)
            const titleLineCount = Math.round(titleRef.current.clientHeight / titleLineHeight) 
            // The longest possible title (60 characters) only spans 2 lines on 1024px screen

            if (titleLineCount === 1) {
                // Compensate for .content-container max-height
                const contentMaxHeight =  68 + 23.5 // Default maxHeight in CSS + actual rendered title line height
                contentRef.current.style.maxHeight = `${contentMaxHeight}px`
            }
        }

        const debouncedUpdateMaxHeight = debounce(updateMaxHeight, 100)

        updateMaxHeight() // Initial setup
        window.addEventListener("resize", debouncedUpdateMaxHeight)

        return () => window.removeEventListener("resize", debouncedUpdateMaxHeight)
    }, [location.pathname, blog])

    return (
        <div className="BlogSnippet">
            {disableInnerLink ? (
                <span className="title">
                    <h2 ref={titleRef}>
                        {blog.title}
                    </h2>
                </span>
            ) : (
                <Link to={`/blog/${blog.slug}`} className="title">
                    <h2>{blog.title}</h2>
                </Link>
            )}

            {blog.content &&
             <div className="content-container" ref={contentRef}>
                {sections.map((sec, index) => {
                    return sec.subtitle ? (
                            <div key={index} className="section">
                                <p className="subtitle">{sec.subtitle}</p>
                                <p className="content">{sec.content}</p>
                            </div>
                        ) : (
                            <p key={index} className="content">{sec.content}</p>
                        )
                })}
                {isOverflowing && <div className="fade-overlay"></div>}
             </div>
            }

            <small className="footer">
                {disableInnerLink ? (
                    <span className="author">
                        {blog.author?.username}
                    </span>
                ) : (
                    <Link to={`/profile/${blog.author?.username}`} className="author">
                        {blog.author?.username}
                    </Link>
                )
                }
                <span className="separator">&nbsp;&bull;&nbsp;</span>
                <span className="timestamp">{formatDayMonth(blog.createdAt)}</span>
            </small>
        </div>
    )
}

export default BlogSnippet

// © 2025 Pitipat Pattamawilai. All Rights Reserved.