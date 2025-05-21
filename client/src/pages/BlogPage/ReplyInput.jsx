import { useEffect, useRef, useState } from "react";
import "./ReplyInput.css"
import { BsSendFill } from "react-icons/bs";

const ReplyInput = (props) => {
    const { onSendReply } = props
    const [replyContent, setReplyContent] = useState("")
    const textareaRef = useRef(null)

    // Auto-expand textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "0px" // Reset height
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [replyContent])

    // Auto focus textarea when rendering
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [])

    // Handle sending reply
    const handleSend = () => {
        if (replyContent.trim() === "") return;
        onSendReply(replyContent.trim())
        setReplyContent("")
    }
    
    return (
        <div className="ReplyInput-container">
            <textarea 
                row = "1"
                value = {replyContent}
                onChange= {(e)=>setReplyContent(e.target.value)}
                ref = {textareaRef}
            />
            <button className="send-button" onClick={handleSend}>
                <BsSendFill />
            </button>
        </div>
    )
}

export default ReplyInput

// © 2025 Pitipat Pattamawilai. All Rights Reserved.