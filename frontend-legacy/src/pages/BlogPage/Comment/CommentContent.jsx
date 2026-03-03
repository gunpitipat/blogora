import { forwardRef, memo } from "react"

const CommentContent = memo(forwardRef(({ 
    className, 
    content, 
    isDeleted, 
    parentAuthor 
}, ref) => {
    return (
        <p className={`comment-content ${className}`}
            ref={ref}
        >
            { !isDeleted && parentAuthor &&
                <span className="reference-author">
                    {`@${parentAuthor} : `}
                </span>
            }
            {content}
        </p>
    )
}))

export default CommentContent

// © 2025 Pitipat Pattamawilai. All Rights Reserved.