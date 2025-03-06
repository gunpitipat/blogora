import { Link } from "react-router-dom"
import "./CommentComponent.css"
import { formatCommentTime, showFullDateTime } from "../services/serviceFunctions"
import { useState, useEffect, useRef } from "react"
import ReplyInput from "./ReplyInput";
import { FaReply } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import { BiSolidMessageRounded } from "react-icons/bi";
import { useViewReplyContext } from "../services/ViewReplyContext";
import { useAuthContext } from "../services/AuthContext";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import ModalComment from "./ModalComment";
import axios from "axios";
import { useLoadingContext } from "../services/LoadingContext";
import LoadingScreen from "./LoadingScreen";
import { useAlertContext } from "../services/AlertContext";

// Recursive Comment Component
const CommentComponent = (props) => {
    const { 
        comment, 
        replies, 
        showReplyInput, 
        individualReplyStatus, 
        replyStatus, 
        blogAuthor, 
        onSendComment, 
        nestedStructure, 
        getAllRelatedReplies,
        showCommentOption,
        toggleCommentOption,
        showCommentModal,
        setShowCommentModal,
        setCommentTrigger,
        parentAuthor, // a reference for the parent comment's author like @gunpitipat
        // level = 1 // level defaults to 1 if not provided
    } = props

    const [ showDateToolTip, setShowDateToolTip ] = useState(false)

    const { viewReply, setViewReply } = useViewReplyContext()
    const [ individualViewReply, setIndividualViewReply ] = useState(false)

    const { user, isAuthenticated } = useAuthContext()

    const { loading, setLoading } = useLoadingContext()

    const { setAlertState } = useAlertContext()

    const contentRef = useRef(null)

    // const MAX_INDENT_LEVEL = 4; // prevents excessive indentation for a clean UI. Indentation is set by .replies applying margin-left: 2rem; in CSS. We want maximum indentation depth of 4 levels which starts counting at the top-level comment.
                                // We will add class level-1,2,3,4 to div.replies. Reply and comment is rendered together meaning the 2nd level comment is indented from the upper level comment. 
                                // So, if we want maximum indentation depth of 4 levels, we have to stop indenting at the 5th level comment which is div.replies of the 4th level comment.


    // Create a reply using shared comment creation function from BlogComponent
    const onSendReply = (replyContent) => {
        onSendComment(replyContent, comment._id)
    }

    const toggleReply = () => {
        const relatedReplies = new Set(getAllRelatedReplies(nestedStructure, comment._id))
        setViewReply(prev => prev.map(element => {
            // If it's currently shown, hide it and all its replies
            if (element.viewReply && relatedReplies.has(element.id)) {
                return { ...element, viewReply: false }
            } 
            // If it's hidden, show the clicked comment and its direct replies
            if (!element.viewReply && element.id === comment._id) {
               return { ...element, viewReply: true }
            }
            return element
        }))
    }

    useEffect(() => {
        if (viewReply.length > 0) { // At very first moment of rendering, viewReply will be an empty array
            const [ tempViewReply ] = viewReply.filter(element => element.id === comment._id).map(element => element.viewReply)
            setIndividualViewReply(tempViewReply)
        }
        // eslint-disable-next-line 
    }, [viewReply]) 

    // Delete comment
    const deleteComment = async (commentId) => {
        setLoading(true)
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API}/blog/comment/${commentId}`,
                { withCredentials: true }
            )
            setShowCommentModal(null)
            setCommentTrigger(prev => !prev)
            setAlertState({ display: true, type: "success", message: response.data.message })
        } catch (error) {
            console.error("Error deleting comment:", error)
        } finally {
            setLoading(false)
        }
    }

    // Limit comment's content height. If content lines are over limit, make it scrollable and show subtle hint.
    

    // Styling connecting line between parent comment and their replies works on 1. div.vertical-line 2. div.reply-connector
    return (
        <div className="comment-container">
            {loading && <LoadingScreen />}
            {/* Comment Section */}
            <div className={`comment ${individualViewReply ? "parent" : ""}`}>
                <p className={`content ${comment.isDeleted ? "isDeleted" : ""}`}
                    ref={contentRef}
                >
                    {!comment.isDeleted && parentAuthor && <strong className="reference-author">@{parentAuthor} :&nbsp;</strong>}
                    {comment.content}
                </p>
                { !comment.isDeleted &&
                    <small>
                        <Link to={`/profile/${comment.user.username}`} className="author">
                            { comment.user.username }
                        </Link>
                        <span className="authorComment">&nbsp;{blogAuthor === comment.user.username ? <FaUserPen /> : null }</span>
                        &nbsp;&bull;&nbsp;
                        <span className="timestamp"
                            onMouseEnter={() => setShowDateToolTip(true)}
                            onMouseLeave={() => setShowDateToolTip(false)}
                        >
                            {formatCommentTime(comment.createdAt)}
                            <div className={`tooltip ${showDateToolTip ? "show" : ""} `}>
                                {showFullDateTime(comment.createdAt)}
                            </div>
                        </span>
                    </small>
                }
                { !comment.isDeleted && user === comment.user.username
                ?   <div className="setting">
                    <BiDotsHorizontalRounded className="setting-icon" onClick={()=>toggleCommentOption(comment._id)} />
                    { showCommentOption === comment._id &&
                        <ul className="options">
                            <li className="delete" onClick={()=>setShowCommentModal(comment._id)}>Delete</li>   
                        </ul> 
                    }
                    { showCommentModal === comment._id && <ModalComment commentId={comment._id} showModal={showCommentModal} setShowModal={setShowCommentModal} deleteComment={deleteComment} />}
                    </div>
                :   null
                }
            </div>
            {/* Reply Input Section */}
            <div className="comment-footer">
                <div className="footer-utilities">
                    {((user && isAuthenticated) && !comment.isDeleted)
                    ?   <div className="reply-button" onClick={()=>showReplyInput(comment._id)}>
                            <span className="reply-icon">
                                <FaReply style={{ transform: "scale(-1, -1)" }}/>
                            </span>
                            <label>Reply</label>
                        </div>
                    :   <div className={`reply-button ${comment.isDeleted ? "isDeleted" : "disable"}`}>
                            <span className="reply-icon">
                                <FaReply style={{ transform: "scale(-1, -1)" }}/>
                            </span>
                            <label>Reply</label>
                        </div>
                    }
                    {replies.length > 0 &&
                        <div onClick={toggleReply} className="viewReply-button">
                            <span className="viewReply-icon">
                                <BiSolidMessageRounded />
                            </span>
                            {individualViewReply
                            ? `Hide ${replies.length === 1 ? "reply" : "replies"}`
                            : `View ${replies.length === 1 ? "1 reply" : `all ${replies.length} replies`}`
                            }
                        </div>
                    }
                </div>
                { replies.length > 0 && individualViewReply && <div className="vertical-line"></div>}
                { individualReplyStatus && <ReplyInput onSendReply={onSendReply} />}
            </div>
            {/* Reply Section */} {/* Render Replies Recursively by calling CommentComponent itself */}
            {/* <div className={`replies level-${Math.min(level, MAX_INDENT_LEVEL)}`}> */}
            <div className="replies">
                {replies.length > 0 && individualViewReply && 
                    replies.map((reply, index) => {
                        const [nestedIndividualReplyStatus] = replyStatus.filter(element => element.id === reply._id).map(element => element.showReply)
                        return (
                            <div className={`reply-wrapper ${index === replies.length - 1 ? "last-reply" : ""}`}
                                 key={reply._id} 
                            >
                                <div className="reply-connector"></div>
                                <CommentComponent
                                    // Comment and Reply Content
                                    comment={reply}
                                    replies={reply.replies}

                                    // Show / Hide Reply Input
                                    showReplyInput={showReplyInput}
                                    individualReplyStatus={nestedIndividualReplyStatus}
                                    replyStatus={replyStatus} // for nested replies
                                    nestedStructure={nestedStructure}
                                    getAllRelatedReplies={getAllRelatedReplies}

                                    blogAuthor={blogAuthor} // just in case author writes a comment or reply, then show "author" next to username
                                    // Create a Reply
                                    onSendComment={onSendComment}

                                    // Delete Button and Confirm Modal
                                    showCommentOption={showCommentOption}
                                    toggleCommentOption={toggleCommentOption}
                                    showCommentModal={showCommentModal}
                                    setShowCommentModal={setShowCommentModal}
                                    setCommentTrigger={setCommentTrigger}

                                    // Reference to the parent comment's author
                                    parentAuthor={comment.user.username}

                                    // Level for limiting indentation depth for clean UI
                                    // level={level + 1}
                                />
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default CommentComponent

// © 2025 Pitipat Pattamawilai. All Rights Reserved.