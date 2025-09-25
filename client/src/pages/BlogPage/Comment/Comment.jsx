import "./Comment.css"
import api from "../../../utils/api";
import clsx from "clsx"
import { useState, useEffect, useRef, memo, useMemo } from "react"
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
    viewReply,
    setViewReply,
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

    const { user } = useAuthContext()
    const { setAlertState } = useAlertContext()

    const canDeleteComment = !comment.isDeleted && (
        user?.username === comment.author?.username ||
        user?.role === "admin" ||
        user?.username === blogAuthor
    )

    useEffect(() => {
        if (viewReply) {
            const [viewReplyState] = viewReply.filter(element => element.id === comment._id).map(element => element.viewReply)
            setIndividualViewReply(viewReplyState)
        }
    }, [viewReply, comment._id]) 

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
            const response = await api.delete(`/blog/comment/${commentId}`)
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
            // setCommentLoading(false) will run in useEffect once comment fetching is complete
            setShowCommentModal(null)
            setShowCommentOption(null)
        }
    }

    // Expandable comment content with smooth transition
    useEffect(() => {
        const checkOverflowing = () => {
            if (contentRef.current) {
                const BASE_MAX_HEIGHT = 108 // CSS default max-height
                setIsOverflowing(contentRef.current.scrollHeight > BASE_MAX_HEIGHT)
            } 
        }

        checkOverflowing()
        window.addEventListener("resize", checkOverflowing)  // Recheck on resize as content may grow on narrower screens

        return () => window.removeEventListener("resize", checkOverflowing)
    }, [comment.content, isExpanded])

    const toggleExpand = () => {
        const el = contentRef.current
        if (!el) return

        const BASE_MAX_HEIGHT = 108

        const handleTransitionEnd = () => {
            el.removeEventListener("transitionend", handleTransitionEnd)
            if (!isExpanded) {
                el.style.maxHeight = "none" // Allow dynamic resizing after expanding
            }
            setIsExpanded(prev => !prev)
        }

        // Expanding
        if (!isExpanded) {
            el.style.maxHeight = `${el.scrollHeight}px`
            el.addEventListener("transitionend", handleTransitionEnd)
        }
        // Collapsing
        else {
            // Reset from "none" to current height to enable transition
            el.style.maxHeight = `${el.scrollHeight}px`
            // Slight delay to let browser recognize height, ensuring transition works
            requestAnimationFrame(() => {
                el.style.maxHeight = `${BASE_MAX_HEIGHT}px`
                el.addEventListener("transitionend", handleTransitionEnd)
            })
        }
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
                    className={`${comment.isDeleted ? "is-deleted" : ""}`}
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
                        author={comment.author?.username}
                        isBlogAuthor={blogAuthor === comment.author?.username}
                        createdDate={comment.createdAt}
                        isOverflowing={isOverflowing}
                    />
                }
            </div>
            { level <= maxIndent &&
                <CommentActions 
                    isDeleted={comment.isDeleted}
                    toggleReplyInput={() => toggleReplyInput(comment._id)}
                    replyLength={replies.length}
                    toggleViewReply={toggleViewReply}
                    individualViewReply={individualViewReply}
                    isReplyInputOpen={isReplyInputOpen}
                    onSendReply={onSendReply}
                />
            }
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
                                viewReply={viewReply}
                                setViewReply={setViewReply}
                                nestedStructure={nestedStructure}
                                getAllRelatedReplies={getAllRelatedReplies}
                                blogAuthor={blogAuthor}
                                parentAuthor={comment.author?.username} // Reference to the parent comment's author
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