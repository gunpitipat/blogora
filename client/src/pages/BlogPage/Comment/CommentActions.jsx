import { useAuthContext } from "../../../contexts/AuthContext"
import CommentInput from "../AddComment/CommentInput";
import { FaReply } from "react-icons/fa";
import { BiSolidMessageRounded } from "react-icons/bi";

const CommentActions = ({ 
    isDeleted, 
    toggleReplyInput, 
    replyLength,
    toggleViewReply,
    individualViewReply,
    isReplyInputOpen,
    onSendReply
}) => {
    const { user, isAuthenticated } = useAuthContext()
    const isLoggedIn = isAuthenticated && user?.username

    return (
        <section className="comment-actions">
            <div className="action-btns">
                <div className={`reply-btn ${!isLoggedIn || isDeleted ? "disabled" : ""}`}
                    onClick={(isLoggedIn && !isDeleted) ? toggleReplyInput : undefined}
                >
                    <span className="reply-icon">
                        <FaReply style={{ transform: "scale(-1, -1)" }}/>
                    </span>
                    <span className="reply-label">
                        Reply
                    </span>
                </div>
                { replyLength > 0 &&
                    <div className="view-reply-btn" onClick={toggleViewReply}>
                        <span className="view-reply-icon">
                            <BiSolidMessageRounded />
                        </span>
                        <span className="view-reply-label">
                            { individualViewReply
                                ? `Hide ${replyLength === 1 ? "reply" : "replies"}`
                                : `View ${replyLength === 1 ? "1 reply" : `all ${replyLength} replies`}`
                            }
                        </span>
                    </div>
                }
            </div>
            { replyLength > 0 && individualViewReply &&
               <div className="connector--vertical" /> 
            }
            { isReplyInputOpen &&
                <CommentInput 
                    onSend={onSendReply} 
                    className="reply-textarea" 
                />
            }
        </section>
    )
}

export default  CommentActions

// © 2025 Pitipat Pattamawilai. All Rights Reserved.