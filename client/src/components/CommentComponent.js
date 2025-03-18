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
import { debounce } from "lodash"

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
        setShowCommentOption,
        showCommentModal,
        setShowCommentModal,
        setCommentTrigger,
        parentAuthor, // Reference to the parent comment's author (e.g., @gunpitipat)
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

    // Limit indentation depth to prevent UI breaking or content overflow
    const [maxIndent] = useState(2) // Display comments in 3 levels with 2 levels of indentation

    // Responsive Design
    const [isTablet, setIsTablet] = useState(window.innerWidth <= 700 && window.innerWidth > 575)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 575)

    useEffect(() => {
        const handleResize = debounce(() => { // Debounce updates state only after 100ms of inactivity (user stops resizing), preventing unnecessary renders
            setIsTablet(window.innerWidth <= 700 & window.innerWidth > 575)
            setIsMobile(window.innerWidth <= 575)
        }, 100)

        window.addEventListener("resize", handleResize)

        return () => window.removeEventListener("resize", handleResize)
    }, [comment]) // Ensure it runs after content is available

    // Create a reply using shared comment creation function from BlogComponent
    const onSendReply = (replyContent) => {
        onSendComment(replyContent, comment._id)
    }

    const toggleReply = () => {
        const relatedReplies = new Set(getAllRelatedReplies(nestedStructure, comment._id))
        setViewReply(prev => prev.map(element => {
            // If it's showing, hide it and all its replies
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
        if (viewReply.length > 0) { // Initially viewReply is an empty array
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
            setShowCommentOption(null)
        } catch (error) {
            console.error("Error deleting comment:", error)
        } finally {
            setLoading(false)
        }
    }

    // Expandable comment content with smooth transition
    useEffect(() => {
        // Check if content overflows
        const checkOverflowing = () => {
            if (contentRef.current) {       
                setTimeout(() => {                 
                    setIsOverflowing(isExpanded || contentRef.current.scrollHeight > contentRef.current.clientHeight) // Check if total content height exceeds visible height
                }, 50) // Delay before updating isOverflowing to prevent the show button from disappearing when expanding and collapsing it back
                       // Cause: setIsExpanded in toggleExpand runs asynchronously triggering useEffect to update isOverflowing while max-height was still "none" and had not been reset to "150px" yet, making isOverflowing false
            }                   
            // When resizing to mobile with content still expanded (isExpanded = true), the "Show less" button disappeared due to max-height: none; (isOverflowing = false)
            // To fix this, keep isOverflowing true when expanding by including isExpanded in setIsOverflowing
        }
        checkOverflowing()
        window.addEventListener("resize", checkOverflowing) // Recheck on resize as screen size (content width) changes affect content height

        return () => window.removeEventListener("resize", checkOverflowing)
    }, [comment.content, isExpanded]) // Ensure useEffect captures updated isExpanded value

    // Toggle content with transition
    const toggleExpand = () => {
        if (contentRef.current) {
            // Expanding (false -> true)
            if (!isExpanded) {
                contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`

                // After transition, remove max-height so it adjusts dynamically
                setTimeout(() => {
                    contentRef.current.style.maxHeight = "none"
                }, 300) // Transition duration
            }
            // Collapsing (true -> false)
            else {
                contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px` // Assign a starting value instead of "none" for animating transition

                // Small delay to let browser recognize current height first and detect height change (prevent it from ignoring the transition)
                setTimeout(() => {
                    contentRef.current.style.maxHeight = "150px" // Default max-height set in CSS
                }, 10)
            }
        }
        setIsExpanded(!isExpanded)
    }

    // Styling the connecting line between parent comment and replies via div.vertical-line and div.reply-connector
    return (
        <div className="comment-container">
            {loading && <LoadingScreen />}
            {/* Comment Section */}
            <div className={`comment ${individualViewReply ? "parent" : ""} level-${level > maxIndent ? maxIndent+1 : level} ${showCommentOption === comment._id ? "fade" : ""}`}>
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
                    <small className={`${(isTablet && isOverflowing) ? "isTablet-overflowing" : ""} ${isMobile && isOverflowing ? "isMobile-overflowing" : ""}`}>
                        <Link to={`/profile/${comment.user.username}`} className="author">
                            { comment.user.username }
                            <span className="authorComment">&nbsp;{blogAuthor === comment.user.username ? <FaUserPen /> : null }</span>
                        </Link>
                        {!isMobile && <span>&nbsp;&bull;&nbsp;</span>}
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
                { ((!comment.isDeleted && user?.username === comment.user.username) || (!comment.isDeleted && user?.role === "admin")) &&
                   <div className="setting">
                    <BiDotsHorizontalRounded className="setting-icon" onClick={()=>toggleCommentOption(comment._id)} />
                    { showCommentOption === comment._id &&
                        <ul className="options">
                            <li className="delete" onClick={()=>setShowCommentModal(comment._id)}>Delete</li>   
                        </ul> 
                    }
                    { showCommentModal === comment._id && <ModalComment commentId={comment._id} showModal={showCommentModal} setShowModal={setShowCommentModal} deleteComment={deleteComment} />}
                    </div>
                }
            </div>
            {/* Reply Input Section */}
            <div className={`comment-footer ${level > maxIndent ? "hidden" : ""} level-${level}`}>
                <div className="footer-utilities">
                    {((user?.username && isAuthenticated) && !comment.isDeleted)
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

                                    // Show/hide Reply Input
                                    showReplyInput={showReplyInput}
                                    individualReplyStatus={nestedIndividualReplyStatus}
                                    replyStatus={replyStatus} // For nested replies
                                    nestedStructure={nestedStructure}
                                    getAllRelatedReplies={getAllRelatedReplies}

                                    blogAuthor={blogAuthor} // Show "author" next to username if they comment on their own post
                                    // Create a Reply
                                    onSendComment={onSendComment}

                                    // Delete button and Confirm Modal
                                    showCommentOption={showCommentOption}
                                    toggleCommentOption={toggleCommentOption}
                                    showCommentModal={showCommentModal}
                                    setShowCommentModal={setShowCommentModal}
                                    setCommentTrigger={setCommentTrigger}

                                    // Reference to the parent comment's author
                                    parentAuthor={comment.user?.username}

                                    // Level for limiting indentation depth
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