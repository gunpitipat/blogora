import { useEffect, useRef, useState } from "react";
import "./CommentInput.css"
import { BsSendFill } from "react-icons/bs";

const CommentInput = (props) => {
    const { onSendComment } = props
    const [commentContent, setCommentContent] = useState("")
    const textareaRef = useRef(null)

    // Auto-expand textarea
    useEffect(() => {
        if (textareaRef.current) { // ensure textarea element exists in the DOM before accessing and modifying it
            textareaRef.current.style.height = "auto" // reset height
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px` // scrollHeight is element's content height including padding, but not margin and border
        }
    }, [commentContent])

    // Auto focus textarea when rendering
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [])

    // Handle sending comment
    const handleSend = () => {
        if (commentContent.trim() === "") return;
        onSendComment(commentContent.trim())
        setCommentContent("")
    }


    return (
        <div className="CommentInput-container">
            <textarea 
                rows = "1"
                ref = {textareaRef}
                value = {commentContent}
                onChange = {(e)=>setCommentContent(e.target.value)}
            />
            <button className="send-button" onClick={handleSend}>
                <BsSendFill />
            </button>
        </div>
    )
}

export default CommentInput