import "./AddComment.css"
import { memo, useState } from "react";
import { useAuthContext } from "../../../contexts/AuthContext"
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import CommentInput from "./CommentInput";
import Tooltip from "../../../components/Tooltip/Tooltip"
import { LuCirclePlus, LuCircleMinus } from "react-icons/lu";

const AddComment = memo(({ 
    showCommentInput, 
    toggleCommentInput, 
    onSend 
}) => {
    const [showTooltip, setShowTooltip] = useState(false)
    const { user, isAuthenticated } = useAuthContext()
    const isMobile = useMediaQuery("(max-width: 768px)")

    const isLoggedIn = user?.username && isAuthenticated
    
    return (
        <section className="add-comment">
            { isLoggedIn 
                ?   <div>
                        <button className={`add-comment-btn ${showCommentInput ? "active" : ""}`} 
                            onClick={toggleCommentInput}
                        >
                            <span className="add-comment-icon">
                                { !showCommentInput ? <LuCirclePlus /> : <LuCircleMinus /> }
                            </span>
                            <span>Comment</span>
                        </button>
                        { showCommentInput && 
                            <CommentInput 
                                onSend={onSend} 
                                className="comment-textarea" 
                            />
                        }
                    </div>
                :   <button className={`add-comment-btn disabled ${isMobile ? "no-hover" : ""}`}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}   
                    >
                        <span className="add-comment-icon">
                            <LuCirclePlus />
                        </span>
                        <span>
                            <p>Comment</p>
                            <Tooltip 
                                showTooltip={showTooltip}
                                content={<p>Join the conversation! Log in to share your thoughts</p>}
                                style={{ fontSize: "0.9rem" }}
                                baseTransform="translateX(-8px) translateY(-50%)"
                                activeTransform="translateX(0) translateY(-50%)"
                                duration={0.3}
                            />
                        </span>
                    </button>
            }
        </section>
    )
})

export default AddComment

// © 2025 Pitipat Pattamawilai. All Rights Reserved.