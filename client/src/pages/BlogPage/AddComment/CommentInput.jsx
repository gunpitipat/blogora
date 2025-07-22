import "./CommentInput.css"
import { useEffect, useRef, useState } from "react";
import { BsSendFill } from "react-icons/bs";

const CommentInput = ({ onSend, className }) => {
    const [commentContent, setCommentContent] = useState("")
    const textareaRef = useRef(null)

    // Auto-expand textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto" // Reset height
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [commentContent])

    // Auto focus textarea when rendering
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [])

    // Send Comment/Reply
    const handleSend = () => {
        if (commentContent.trim() === "") return;
        onSend(commentContent.trim())
        setCommentContent("")
    }

    return (
        <div className={`comment-input ${className}`}>
            <textarea 
                rows="1"
                ref={textareaRef}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
            />
            <button className="send-button" onClick={handleSend}>
                <BsSendFill />
            </button>
        </div>
    )
}

export default CommentInput

// © 2025 Pitipat Pattamawilai. All Rights Reserved.