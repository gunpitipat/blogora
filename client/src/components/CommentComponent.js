import { Link } from "react-router-dom"
import "./CommentComponent.css"
import { formatCommentTime, showFullDateTime } from "../services/serviceFunctions"
import { useState, useEffect, useRef } from "react"
import ReplyInput from "./ReplyInput";
import { FaReply, FaChevronDown, FaChevronUp } from "react-icons/fa";
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
        level,
    } = props

    const [ showDateToolTip, setShowDateToolTip ] = useState(false)

    const { viewReply, setViewReply } = useViewReplyContext()
    const [ individualViewReply, setIndividualViewReply ] = useState(false)

    const { user, isAuthenticated } = useAuthContext()

    const { loading, setLoading } = useLoadingContext()

    const { setAlertState } = useAlertContext()

    const contentRef = useRef(null)
    const [isOverflowing, setIsOverflowing] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    // Limit indentation depth
        // We have 3 different margin-left bar colors for comments in each level where contains level-1, level-2, level-3.
        // We apply maximum indent depth to prevent UI from breaking or content from overflowing.
        // We want to display comments in different 3 indented levels meaning comments can be indented 2 times from the top level. maxIndent state will be 2.
        // At max level, all deeper comments remain at the same level and are grouped together under the same viewReply button.
    const [maxIndent] = useState(2) // prevents excessive indentation for a clean UI. Indentation is set by .replies applying margin-left: 2rem; in CSS.

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

    // * Expandable comment content with smooth transition
    // Limit comment's content height. Check if content overflows (scrollHeight > clientHeight). If it does, show a Show-more button
    useEffect(() => {
        const checkOverflowing = () => {
            if (contentRef.current) {       
                setTimeout(() => {                 // Check if total content height of an element is greater than its visible height
                    setIsOverflowing(isExpanded || contentRef.current.scrollHeight > contentRef.current.clientHeight) 
                }, 50) // Add a slight delay before updating isOverflowing to prevent the show-more/less button from disappearing when expanding then collapsing it back. This happened because setIsExpanded(!isExpanded) in toggleExpand run asynchronously triggering useEffect to update isOverflowing while max-height was still "none" and had not been reset to "150px" yet. This caused isOverflowing to be false.
            }                   
            // Before fixing, when screen resizes to mobile while the content is expanded (isExpanded = true), the "Show less" button will disappear because at that state, max-height: none; making condition of checkOverflowing to false,
            // so we have to keep isOverflowing true when expanding. That's why we add isExpanded in setIsOverflowing
        }
        checkOverflowing()
        window.addEventListener("resize", checkOverflowing) // Update the check on window resize, since screen size affects content width, resulting in changes in height

        return () => window.removeEventListener("resize", checkOverflowing)
    }, [comment.content, isExpanded]) // Add isExpanded as a dependency to make sure useEffect doesn't capture only its intial value of false

    // Content toggle transition. Previously, when expanding, we apply CSS rule of max-height: none; to allow the whole content to show but the browser doesn't know how to animate from an explicit value to none, so we use Javascript to make transition smoothly as expected.
    const toggleExpand = () => {
        if (contentRef.current) {
            // Expanding (isExpanded: false -> true)
            if (!isExpanded) {
                contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`

                // After transition, remove max-height so it adjusts dynamically (use max-height: none as we did earlier before fixing)
                setTimeout(() => {
                    contentRef.current.style.maxHeight = "none"
                }, 300) // transition duration
            }
            // Collapsing (true -> false)
            else {
                contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px` // Assign a starting value instead of "none" for animating transition

                // Small delay to let the browser recognize a current height first and detect a height change to prevent it from ignoring the transition
                setTimeout(() => {
                    contentRef.current.style.maxHeight = "150px" // as a default max-height set in CSS file
                }, 10)
            }
        }
        setIsExpanded(!isExpanded)
    }

    // Styling connecting line between parent comment and their replies works on 1. div.vertical-line 2. div.reply-connector
    return (
        <div className="comment-container">
            {loading && <LoadingScreen />}
            {/* Comment Section */}
            <div className={`comment ${individualViewReply ? "parent" : ""} level-${level > maxIndent ? maxIndent+1 : level}`}>
                <p className={`content ${comment.isDeleted ? "isDeleted" : ""} ${isExpanded ? "expanded" : ""}`}
                    ref={contentRef}
                >
                    {!comment.isDeleted && parentAuthor && <strong className="reference-author">@{parentAuthor} :&nbsp;</strong>}
                    {comment.content}
                </p>
                { isOverflowing && 
                    <div className="content-expand-icon" onClick={toggleExpand}>
                        { !isExpanded 
                            ? <span>Show more <FaChevronDown /></span> 
                            : <span>Show less <FaChevronUp /></span>}
                    </div>
                }
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
            <div className={`comment-footer ${level > maxIndent ? "hidden" : ""}`}>
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
                                    level={reply.level}
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