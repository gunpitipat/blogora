import clsx from "clsx"
import { memo } from "react"
import { Link } from "react-router-dom"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import Timestamp from "@/components/Timestamp/Timestamp"
import { FaUserPen } from "react-icons/fa6"

const CommentFooter = memo(({ 
    author, 
    isBlogAuthor, 
    createdDate, 
    isOverflowing 
}) => {
    const isSmallScreen = useMediaQuery("(max-width: 712px)")
    const isMobile = useMediaQuery("(max-width: 575px)")

    return (
        <section className={clsx("comment-footer", {
            "sm-overflowing" : isOverflowing && isSmallScreen
        })}>
            <Link to={`/profile/${author}`} className="author">
                {author}
                { isBlogAuthor &&
                    <span className="blog-author-icon">
                        <FaUserPen />
                    </span>
                }
            </Link>
            { !isMobile && 
                <span>&nbsp;&bull;&nbsp;</span> 
            }
            <Timestamp date={createdDate} />
        </section>
    )
})

export default CommentFooter

// © 2025 Pitipat Pattamawilai. All Rights Reserved.