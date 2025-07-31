import "./BlogPage.css"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useAlertContext } from "../../contexts/AlertContext"
import { useLoadingContext } from "../../contexts/LoadingContext"
import { useAuthContext } from "../../contexts/AuthContext";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen"
import NotFound from "../NotFound/NotFound"
import BlogContent from "./Blog/BlogContent"
import AddComment from "./AddComment/AddComment"
import Comment from "./Comment/Comment";
import Footer from "../../components/Layout/Footer"
import BackToTopButton from "../../components/Buttons/BackToTopButton"

const BlogPage = () => {
    // Blog
    const { slug } = useParams()
    const [blog, setBlog] = useState(null)
    const [blogExists, setBlogExists] = useState(null)
    
    // Comment
    const [showCommentInput, setShowCommentInput] = useState(false)
    const [comments ,setComments] = useState([])
    const [showReplyInput, setShowReplyInput] = useState([])
    const [viewReply, setViewReply] = useState([])
    const [commentTrigger, setCommentTrigger] = useState(false)
    const [commentLoading, setCommentLoading] = useState(false) // Isolate comment loading state to avoid flickering with blog loading
    const [showCommentOption, setShowCommentOption] = useState(null) // Track which comment's setting button is open
    const [showCommentModal, setShowCommentModal] = useState(null)

    const { setAlertState } = useAlertContext()    
    const { setLoading } = useLoadingContext()
    const { user } = useAuthContext()   
    const navigate = useNavigate()

    // Retrieve a blog
    const getBlog = async (abortSignal) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/blog/${slug}`, { 
                withCredentials: true,
                signal: abortSignal
            })
            return response.data

        } catch (error) {
            // Ignore request cancellation errors
            if (axios.isCancel(error)) {
                return null
            }

            if (!error.response) {
                setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
            } else {
                if (error.response.status === 500) {
                    setAlertState({ display: true, type: "error", message: error.response.data?.message || "Server error. Please try again later." })
                } else if (error.response.status === 404) {
                    throw error // Skip logging a 404 error
                }
            }
            console.error("Error fetching a blog")
            throw error
        }
    }

    useEffect(() => {
        if (!slug) return; // Prevent fetching when slug is undefined initially

        const controller = new AbortController()
        const { signal } = controller

        const fetchBlog = async () => {
            setLoading(true)
            setBlogExists(null) // Reset old value before making a new request to prevent flickering when navigating between valid/invalid slugs
            setBlog(null) // Reset blog data to prevent old content from showing
            
            try {
                const blogData = await getBlog(signal)

                if (blogData) {
                    setBlog(blogData)
                    setBlogExists(true)
                } // If using else block and setBlogExists(false), it will runs too early, and <NotFound /> will flicker
            
            } catch (error) {
                if (error.response?.status === 404) {
                    setBlogExists(false) // Only set this when the blog is truly not found
                } else {
                    // Prevent users from getting stuck in LoadingScreen in case of network / server error
                    setBlogExists(true) // Show a blank page with alert message
                } 

            } finally {
                setLoading(false);
            }
        }

        fetchBlog()
        return () => controller.abort()
        // eslint-disable-next-line
    }, [slug]) // Triggers useEffect when navigating between blog posts without a full page reload (from /blog/my-post-1 to /blog/my-post-2)

    // Retrieve comments
    const getComments = async (abortSignal) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/blog/${slug}/comments`, { 
                withCredentials: true, 
                signal: abortSignal 
            })
            return response.data

        } catch (error) {
            if (axios.isCancel(error)) {
                return null
            } else {
                if (error.response?.status === 404) {
                    return null // Skip logging
                }
                console.error("Error fetching comments")
            }
        }
    }

    useEffect(() => { // Runs when slug changes or user posts a new comment
        if (!slug) return;

        const controller = new AbortController()
        const { signal } = controller

        const fetchComments = async () => {
            setCommentLoading(true)

            try {
                const commentsData = await getComments(signal)
                if (commentsData && commentsData.length > 0) {
                    setComments(commentsData)

                    const initialShowReplyInput = commentsData.map(comment => {
                        return { id: comment._id, replyInput: false }
                    })
                    setShowReplyInput(initialShowReplyInput)

                    // Initialize viewReply at the first render
                    if (viewReply.length === 0) {
                        const initialViewReply = commentsData.map(comment => {
                            return { id: comment._id, viewReply: false }
                        })
                        setViewReply(initialViewReply)
                    }
                    // Update viewReply with current state
                    if (viewReply.length > 0) {
                        setViewReply(prev => {
                            const newComment = commentsData[commentsData.length - 1] // The new comment is the last sorted by createdAt in Comments model
                            return [ ...prev, { id: newComment._id, viewReply: false }]
                        })
                    }
                }
                
            } finally {
                setCommentLoading(false)
            }
        }

        fetchComments()
        return () => controller.abort()
        // eslint-disable-next-line
    }, [slug, commentTrigger])

    // Function to toggle comment's delete button
    const toggleCommentOption = useCallback((commentId) => {
        setShowCommentOption(prev => (prev === commentId ? null : commentId))
    }, [])

    // Close comment setting button when clicking outside
    useEffect(() => {
        const handleClickOutSide = (e) => {
            if (!showCommentOption) return

            if (showCommentModal) {
                if (e.target.classList.contains("modal-overlay") || e.target.classList.contains("cancel-btn")) {
                    setShowCommentOption(null)
                    setShowCommentModal(null)
                }
            } else {
                if (!e.target.closest(".comment-setting") && !e.target.closest(".modal")) { // Setting tab has its own open-close handler Exclude comment Modal condition since it's written separately below
                    setShowCommentOption(null)
                }   
            }
        }

        document.addEventListener("click", handleClickOutSide)
        return () => document.removeEventListener("click", handleClickOutSide)
    }, [showCommentOption, showCommentModal])

    // Delete Blog
    const deleteBlog = async (slug, onCleanup = () => {}) => {
        setLoading(true)
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API}/blog/${slug}`, { 
                withCredentials: true 
            })
            setLoading(false)
            setAlertState({ display: true, type: "success", message: response.data.message })
            navigate(`/profile/${user.username}`)
        
        } catch (error) {
            if (!error.response) {
                setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
            } else {
                setAlertState({ display: true, type: "error", message: error.response.data?.message || "Something went wrong. Please try again." })
            }

        } finally {
            setLoading(false)
            onCleanup?.()
        }
    }

    const toggleCommentInput = () => {
        setShowReplyInput(prev => prev.map(comment => {
            return { ...comment, replyInput: false } // Collapse any expanding reply input elsewhere
        }))
        setShowCommentInput(!showCommentInput)
    }

    // Show only the clicked reply input; collapse any previously opened one
    const toggleReplyInput = useCallback((commentId) => {
        setShowCommentInput(false) // Collapse comment input if still open
        setShowReplyInput(prev => prev.map(comment => {
            if (comment.id === commentId) {
                return comment.replyInput 
                    ? { ...comment, replyInput: false } 
                    : { ...comment, replyInput: true }
            }
            return { ...comment, replyInput: false }
        }))
    }, [])

    // Create a comment and reply
    const onSendComment = useCallback(async (commentContent, parentCommentId = null) => {
        setCommentLoading(true)
        try {
            const response = await axios.post(`${process.env.REACT_APP_API}/blog/${slug}/comment`, 
                { 
                    content: commentContent,
                    parentCommentId: parentCommentId || null
                },
                { withCredentials: true }
            )
            setAlertState({ display: true, type: "success", message: response.data.message })
            setCommentTrigger(prev => !prev) // Toggle trigger to refresh comment

            // Automatically show the reply the user has just created
            if (parentCommentId) {
                setViewReply(prev => prev.map(element => (
                    element.id === parentCommentId 
                        ? { ...element, viewReply: true } 
                        : element
                )))
            }

        } catch (error) {
            setCommentLoading(false)
            if (!error.response) {
                setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
            } else {
                setAlertState({ display: true, type: "error", message: error.response.data?.message || "Something went wrong. Please try again." })
            }

        } finally {
            setShowCommentInput(false)
            setShowReplyInput(prev => prev.map(element => ({ ...element, replyInput: false })))
            // setCommentLoading(false) is handled in useEffect after comment loading to avoid flickering
        }
        // eslint-disable-next-line
    }, [slug]) 
        
    // Convert a flat comment array to nested structure
    const organizeComments = (comments) => {
        const commentMap = {}; // Store comments by ID

        // Initialize all comments
        comments.forEach(comment => {
            commentMap[comment._id] = { ...comment, replies: [] }
        })

        const rootComments = []

        // Organize comments into a tree
        comments.forEach(comment => {
            if (comment.parentComment) {
                // If the comment has a parent, add it as a reply
                commentMap[comment.parentComment].replies.push(commentMap[comment._id])
            } else {
                // Otherwise, it's a root-level comment
                rootComments.push(commentMap[comment._id])
            }
        })
        return rootComments;
    }

    // Get a comment ID and all nested replies in the same thread 
    // Used with viewReply to open only one direct reply and collapse all related nested ones
    const getAllRelatedReplies = useCallback((nestedStructure, targetId) => {
        let result = [];
        for (const element of nestedStructure) {
            if (element._id === targetId) {
                result.push(element._id) // Add the target comment itself
    
                // Recursive function to collect all nested replies
                const collectAllReplies = (repliesArray) => {
                    let nestedReplies = [];
                    for (const element of repliesArray) {
                        nestedReplies.push(element._id) // Add the reply's ID

                        if (element.replies?.length > 0) {
                            nestedReplies.push(...collectAllReplies(element.replies)) // Recursively collect more
                        }
                    }
                    return nestedReplies;
                }
    
                if (element.replies?.length > 0) {
                    result.push(...collectAllReplies(element.replies))
                }
                return result; // Return once the target ID and all its replies are found
            }
            if (element.replies?.length > 0) { // If targetId hasn't matched element._id yet, search deeper in its replies
                const recursiveResult = getAllRelatedReplies(element.replies, targetId)
                result.push(...recursiveResult)
            }
        }
        return result
    }, [])

    // Recursively assign hierarchy level to each comment
    const hierarchyLevel = useCallback((nestedStructure, level = 1) => {
        return nestedStructure.map(comment => {
            // If comment has no replies
            if (comment.replies?.length === 0) {
                return { ...comment, level: level }
            }
            // If comment has a replies array
            else {
                return { 
                    ...comment,
                    level: level,
                    replies: hierarchyLevel(comment.replies, level + 1)
                }
            }
        })
    }, [])

    // Create nested comment tree
    const nestedComments = useMemo(() => {
        return organizeComments(comments)
        // eslint-disable-next-line 
    }, [comments]) // Recomputes only if comments changes

    // Add hierarchy level to each comment in the nested tree
    const structuredComments  = useMemo(() => {
        return hierarchyLevel(organizeComments(comments), 1)
        // eslint-disable-next-line 
    }, [nestedComments])

    // Add reply-input state to each comment in the structured tree
    const memoizedComments = useMemo(() => {
        return structuredComments.map(comment => {
            return { ...comment, 
                replyInput: showReplyInput.find(element => element.id === comment._id)?.replyInput ?? false 
            }
        })
    }, [structuredComments, showReplyInput])

    if (blogExists === null) return <LoadingScreen />
    if (blogExists === false) return <NotFound />
    if (blogExists && blog) {
        return (
            <div className="blog-page">
                <BlogContent 
                    title={blog.title}
                    content={blog.content}
                    author={blog.author?.username}
                    createdDate={blog.createdAt}
                    slug={blog.slug}
                    onDelete={deleteBlog}
                />
                <AddComment 
                    showCommentInput={showCommentInput}
                    toggleCommentInput={toggleCommentInput}
                    onSend={onSendComment}
                />
                <section className={`comments ${memoizedComments.length === 0 ? "no-children" : ""}`}>                    
                    {memoizedComments.map(comment => (
                        <Comment 
                            key={comment._id} 
                            // Comment and Reply
                            comment={comment}
                            replies={comment.replies}
                            // Reply Input
                            toggleReplyInput={toggleReplyInput} 
                            isReplyInputOpen={comment.replyInput}
                            showReplyInput={showReplyInput} // For adding reply-input state to each reply when creating `memoizedReplies`
                            // View/Hide Reply
                            viewReply={viewReply}
                            setViewReply={setViewReply}
                            nestedStructure={nestedComments}
                            getAllRelatedReplies={getAllRelatedReplies} 
                            blogAuthor={blog.author?.username} // Show author icon next to username if commenter is the blog author
                            level={comment.level} // Style based on comment nesting level
                            onSendComment={onSendComment} // Create Reply
                            // Comment Deletion and Modal
                            showCommentOption={showCommentOption}
                            setShowCommentOption={setShowCommentOption}
                            toggleCommentOption={toggleCommentOption}
                            showCommentModal={showCommentModal}
                            setShowCommentModal={setShowCommentModal}
                            setCommentTrigger={setCommentTrigger}
                            setCommentLoading={setCommentLoading}
                        />
                    ))}
                </section>
                { commentLoading && <LoadingScreen /> }
                <BackToTopButton />
                <Footer />
            </div>
        )
    }
}

export default BlogPage

// © 2025 Pitipat Pattamawilai. All Rights Reserved.