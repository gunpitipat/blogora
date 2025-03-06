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
            textareaRef.current.style.height = "0px" // reset height
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px` // scrollHeight is element's content height including padding (total height needed to display all the content inside the element, even if it's larger than the visible area.), but not margin and border
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