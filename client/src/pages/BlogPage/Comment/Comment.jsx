import "./Comment.css"
import axios from "axios";
import clsx from "clsx"
import { useState, useEffect, useRef, memo, useMemo } from "react"
import { useViewReplyContext } from "../../../contexts/ViewReplyContext";
import { useAuthContext } from "../../../contexts/AuthContext";
import { useAlertContext } from "../../../contexts/AlertContext";
import CommentContent from "./CommentContent";
import CommentSetting from "./CommentSetting";
import CommentFooter from "./CommentFooter";
import CommentActions from "./CommentActions";
import ExpandToggle from "./ExpandToggle";

// Recursive Comment Component
const Comment = memo(({ 
    comment, 
    replies, 
    toggleReplyInput, 
    isReplyInputOpen, 
    showReplyInput, 
    nestedStructure, 
    getAllRelatedReplies,
    blogAuthor,
    level, 
    onSendComment, 
    showCommentOption,
    setShowCommentOption,
    toggleCommentOption,
    showCommentModal,
    setShowCommentModal,
    setCommentTrigger,
    setCommentLoading,
    parentAuthor, // Reference to the parent comment's author (e.g., @gunpitipat)
}) => {
    const [maxIndent] = useState(2) // Limit indentation depth: 2 levels of indentation = 3 visible comment levels
    const [individualViewReply, setIndividualViewReply] = useState(false)
    const [isOverflowing, setIsOverflowing] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const contentRef = useRef(null)

    const { viewReply, setViewReply } = useViewReplyContext()
    const { user } = useAuthContext()
    const { setAlertState } = useAlertContext()

    const canDeleteComment = !comment.isDeleted && (
        user?.username === comment.user?.username ||
        user?.role === "admin" ||
        user?.username === blogAuthor
    )

    useEffect(() => {
        if (viewReply.length > 0) { // Initially viewReply is an empty array
            const [viewReplyState] = viewReply.filter(element => element.id === comment._id).map(element => element.viewReply)
            setIndividualViewReply(viewReplyState)
        }
        // eslint-disable-next-line 
    }, [viewReply]) 

    const toggleViewReply = () => {
        const relatedReplies = new Set(getAllRelatedReplies(nestedStructure, comment._id))
        setViewReply(prev => prev.map(element => {
            // If it's showing, hide it and all its replies
            if (element.viewReply && relatedReplies.has(element.id)) {
                return { ...element, viewReply: false }
            } 
            // If it's hidden, show the direct replies of the clicked comment
            if (!element.viewReply && element.id === comment._id) {
               return { ...element, viewReply: true }
            }
            return element
        }))
    }
        
    // Create a reply using comment creation function from BlogPage
    const onSendReply = (replyContent) => {
        onSendComment(replyContent, comment._id)
    }
    
    // Delete comment
    const deleteComment = async (commentId) => {
        setCommentLoading(true)
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API}/blog/comment/${commentId}`,
                { withCredentials: true }
            )
            setCommentTrigger(prev => !prev)
            setAlertState({ display: true, type: "success", message: response.data.message })
        
        } catch (error) {
            setCommentLoading(false)
            if (!error.response) {
                setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
            } else {
                setAlertState({ display: true, type: "error", message: error.response.data?.message || "Something went wrong. Please try again." })
            }
            
        } finally {
            // setLoading(false) will run in useEffect once comment fetching is complete
            setShowCommentModal(null)
            setShowCommentOption(null)
        }
    }

    // Expandable comment content with smooth transition
    useEffect(() => {
        // Check if content overflows
        const checkOverflowing = () => {
            if (contentRef.current) {   
                setTimeout(() => {                 
                    setIsOverflowing(isExpanded || contentRef.current.scrollHeight > contentRef.current.clientHeight) // Check if total content height exceeds visible height
                }, 100) // Delay before updating isOverflowing to prevent the show button from disappearing when collapsing it back after expanding
                       // Cause: setIsExpanded in toggleExpand runs asynchronously, triggering useEffect to update isOverflowing while max-height was still "none" and had not been reset to "150px" yet, making isOverflowing false
            }                   
            // When resizing to mobile with content still expanded (isExpanded = true), the "Show less" button disappeared due to max-height: none; (isOverflowing = false)
            // To fix this, keep isOverflowing true when expanding by including isExpanded in setIsOverflowing
        }
        checkOverflowing()
        window.addEventListener("resize", checkOverflowing) // Recheck on resize as screen width changes affect content height

        return () => window.removeEventListener("resize", checkOverflowing)
    }, [comment.content, isExpanded])

    const toggleExpand = () => {
        if (contentRef.current) {
            // Expanding (false -> true)
            if (!isExpanded) {
                contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`

                // After transition, remove max-height so it can adjust dynamically
                setTimeout(() => {
                    contentRef.current.style.maxHeight = "none"
                }, 300) // CSS transition duration
            }
            // Collapsing (true -> false)
            else {
                contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px` // Assign a starting value instead of "none" for animating transition

                // Small delay to let browser recognize current height and detect height change, ensuring transition works
                setTimeout(() => {
                    contentRef.current.style.maxHeight = "150px" // CSS default max-height
                }, 10)
            }
        }
        setIsExpanded(!isExpanded)
    }

    // Add reply-input state to each reply for passing isReplyInputOpen when rendering replies with Comment component
    const memoizedReplies = useMemo(() => {
        if (replies.length > 0) {
            return replies.map(reply => {
                return { ...reply,
                    replyInput: showReplyInput.find(element => element.id === reply._id)?.replyInput ?? false
                }
            })
        }
    }, [replies, showReplyInput])

    return (
        <div className="thread-container">
            <div className={clsx("comment",
                `level-${level > maxIndent ? maxIndent + 1 : level}`,
                showCommentOption === comment._id && "fade",
            )}>
                <CommentContent 
                    ref={contentRef}
                    className={`${comment.isDeleted ? "is-deleted" : ""} ${isExpanded ? "expanded" : ""}`}
                    content={comment.content}
                    isDeleted={comment.isDeleted}
                    parentAuthor={parentAuthor}
                />
                { canDeleteComment &&
                    <CommentSetting 
                        commentId={comment._id}
                        showOption={showCommentOption}
                        setShowOption={setShowCommentOption}
                        toggleOption={toggleCommentOption}
                        showModal={showCommentModal}
                        setShowModal={setShowCommentModal}
                        deleteComment={deleteComment}
                    />
                }
                { isOverflowing && 
                    <ExpandToggle 
                        onClick={toggleExpand} 
                        isExpanded={isExpanded} 
                    /> 
                }
                { !comment.isDeleted &&
                    <CommentFooter 
                        author={comment.user?.username}
                        isBlogAuthor={blogAuthor === comment.user?.username}
                        createdDate={comment.createdAt}
                        isOverflowing={isOverflowing}
                    />
                }
            </div>
            <CommentActions 
                className={`level-${level} ${level > maxIndent ? "hidden" : ""}`}
                isDeleted={comment.isDeleted}
                toggleReplyInput={() => toggleReplyInput(comment._id)}
                replyLength={replies.length}
                toggleViewReply={toggleViewReply}
                individualViewReply={individualViewReply}
                isReplyInputOpen={isReplyInputOpen}
                onSendReply={onSendReply}
            />
            <div className="replies">
                { replies.length > 0 && individualViewReply && 
                    memoizedReplies.map((reply, index) => (
                        <div className={`reply-wrapper ${index === replies.length - 1 ? "last-reply" : ""}`}
                            key={reply._id} 
                        >
                            <div className="connector" />
                            <Comment
                                // Comment and Reply
                                comment={reply}
                                replies={reply.replies}
                                // Reply Input
                                toggleReplyInput={toggleReplyInput}
                                isReplyInputOpen={reply.replyInput}
                                showReplyInput={showReplyInput}
                                // View/Hide Reply
                                nestedStructure={nestedStructure}
                                getAllRelatedReplies={getAllRelatedReplies}
                                blogAuthor={blogAuthor}
                                parentAuthor={comment.user?.username} // Reference to the parent comment's author
                                level={reply.level}
                                onSendComment={onSendComment}
                                // Comment Deletion and Modal
                                showCommentOption={showCommentOption}
                                setShowCommentOption={setShowCommentOption}
                                toggleCommentOption={toggleCommentOption}
                                showCommentModal={showCommentModal}
                                setShowCommentModal={setShowCommentModal}
                                setCommentTrigger={setCommentTrigger}
                                setCommentLoading={setCommentLoading}
                            />
                        </div>
                    ))
                }
            </div>
        </div>
    )
})

export default Comment

// © 2025 Pitipat Pattamawilai. All Rights Reserved.