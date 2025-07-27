import "./BlogSnippet.css"
import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { extractSubsections } from "../../utils/contentUtils"
import { formatDayMonth } from "../../utils/formatDateUtils";
import { getLineHeight } from "../../utils/layoutUtils";
import { debounce } from "lodash"
import { BsPinAngleFill } from "react-icons/bs";

const BlogSnippet = ({ blog, disableInnerLink }) => {
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

    // Fix uneven BlogSnippet heights on Profile page
    useEffect(() => {
        const updateMaxHeight = () => {
            const isProfilePage = location.pathname.split("/")[1] === "profile"
            const titleEl = titleRef.current
            const contentEl = contentRef.current

            if (!isProfilePage || !titleEl || !contentEl) return
            
            const titleLineHeight = getLineHeight(titleEl)
            const titleLineCount = Math.round(titleEl.clientHeight / titleLineHeight)

            // The longest possible title (70 characters) can span 3 lines at 1024px (two-column layout breakpoint)
            if (titleLineCount === 1) {
                // Default maxHeight + Compensation using actual rendered title line height 
                contentEl.style.maxHeight = `${43 + 23.5 * 2}px`
            } else if (titleLineCount === 2) {
                contentEl.style.maxHeight = `${43 + 23.5}px`
            } else if (titleLineCount === 3) {
                contentEl.style.maxHeight = `43px`
            } else {
                contentEl.style.maxHeight = `28px` // In case title spans 4 lines on mobile
            }
        }
        const debouncedUpdateMaxHeight = debounce(updateMaxHeight, 100)

        updateMaxHeight() // Initial setup
        window.addEventListener("resize", debouncedUpdateMaxHeight)

        return () => {
            window.removeEventListener("resize", debouncedUpdateMaxHeight)
            debouncedUpdateMaxHeight.cancel?.()
        }
    }, [location.pathname, blog])

    return (
        <div className="blog-snippet">
            {/* Blog Title */}
            { disableInnerLink 
                ?   <div className="title">
                        <h2 ref={titleRef}>
                            { blog.isPinned &&
                                <span className="pin-icon">
                                    <BsPinAngleFill />
                                </span>
                            }
                            {blog.title}
                        </h2>
                    </div>
                :   <Link to={`/blog/${blog.slug}`} className="title">
                        <h2>
                            { blog.isPinned &&
                                <span className="pin-icon">
                                    <BsPinAngleFill />
                                </span>
                            }
                            {blog.title}
                        </h2>
                    </Link>
            }

            {/* Blog Content */}
            {blog.content &&
                <div className="content-container" ref={contentRef}>
                    {sections.map((sec, index) => {
                        return sec.subtitle 
                            ?   <div key={index} className="section">
                                    <p className="section-subtitle">{sec.subtitle}</p>
                                    <p className="section-content">{sec.content}</p>
                                </div>
                            :   <p key={index} className="section-content">
                                    {sec.content}
                                </p>
                    })}
                    { isOverflowing && <div className="fade-overlay" /> }
                </div>
            }

            {/* Author and Date */}
            <small className="footer">
                { disableInnerLink 
                    ?   <span className="author">
                            {blog.author?.username}
                        </span>
                    :   <Link to={`/profile/${blog.author?.username}`} className="author">
                            {blog.author?.username}
                        </Link>
                }
                <span className="separator">&nbsp;&bull;&nbsp;</span>
                <span className="created-date">
                    {formatDayMonth(blog.createdAt)}
                </span>
            </small>
        </div>
    )
}

export default BlogSnippet

// © 2025 Pitipat Pattamawilai. All Rights Reserved.