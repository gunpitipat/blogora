import { useParams, Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useState, useEffect, useRef } from "react"
import "./BlogComponent.css"
import ModalConfirm from "./ModalConfirm"
import { useAlertContext } from "../services/AlertContext"
import parser from "html-react-parser"
import { useLoadingContext } from "../services/LoadingContext"
import { useAuthContext } from "../services/AuthContext";
import LoadingScreen from "./LoadingScreen"
import NotFound from "./NotFound"
import CommentInput from "./CommentInput"
import CommentComponent from "./CommentComponent";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { LuCirclePlus, LuCircleMinus } from "react-icons/lu";
import { formatCommentTime, showFullDateTime } from "../services/serviceFunctions"
import { useViewReplyContext } from "../services/ViewReplyContext"
import { IoChevronBackOutline } from "react-icons/io5";

const BlogComponent = () => {
    const { slug } = useParams()
    const [ blog, setBlog ] = useState(null)
    const [ showOptions, setShowOptions ] = useState(false)
    const [ showModal, setShowModal ] = useState(false)
    const [ blogExists, setBlogExists ] = useState(null)
    const [ showDateToolTip, setShowDateToolTip ] = useState(false)

    // comment
    const [ showCommentInput, setShowCommentInput ] = useState(false)
    const [ comments ,setComments ] = useState([])
    const [ replyStatus, setReplyStatus ] = useState([])
    const [ commentTrigger, setCommentTrigger ] = useState(false)
    const [ commentLoading, setCommentLoading ] = useState(false) // If both blog and comments share the same loading state, fetching both at the same time could cause flickering 
                                                                  // (loading spinner briefly disappearing when one request finishes before the other).  
    const { viewReply, setViewReply } = useViewReplyContext()
    const [ showCommentOption, setShowCommentOption ] = useState(null) // Track which comment's setting button is open
    const [ showCommentModal, setShowCommentModal ] = useState(null)

    const [ showCommentToolTip, setShowCommentToolTip ] = useState(null)

    const scrollPositionRef = useRef(0)

    const { setAlertState } = useAlertContext()
    const navigate = useNavigate()
    
    const { setLoading } = useLoadingContext()

    const { user, isAuthenticated } = useAuthContext()

    // Retrieve a blog
    const getBlog = async (abortSignal) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/blog/${slug}`, 
                { signal: abortSignal }
            )
            return response.data
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error("Error fetching a blog:", error)
                throw error
            }
        }
    }

    useEffect(() => {
        if (!slug) return; // Prevent fetching when slug is undefined initially

        const controller = new AbortController()
        const { signal } = controller

        const fetchBlog = async () => {
            setLoading(true)
            setBlogExists(null) // reset blogExists before making a new request (avoid flickering issue when navigating between valid and invalid slugs => if not, blogExists will still be old value until the request completes)
            setBlog(null) // reset blog data to prevent old content from showing
            
            try {
                const blogData = await getBlog(signal)

                if (blogData) {
                    setBlog(blogData)
                    setBlogExists(true)
                } // If use else block and setBlogExists(false), setBlogExists(false) will runs too early, and <NotFound /> will flicker.
                
            } catch (error) {
                console.error("Error fetching blog:", error)

                if (error.response && error.response.status === 404) {
                    setBlogExists(false) // Only set this when the blog is truly not found
                }
            } finally {
                setLoading(false);
            }
        }

        fetchBlog()
        return () => controller.abort()
        // eslint-disable-next-line
    }, [slug]) // dependency is url parameter ensures if the user navigates to another blog post without a full page reload (from /blog/my-test to /blog/gallery), useEffect re-runs.


    // Retrieve comments
    const getComments = async (abortSignal) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/blog/${slug}/comments`,
                { signal: abortSignal }
            )
            return response.data
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error("Error fetching comments:", error)
                throw error
            }
        }
    }

    // Convert a flat comment array to Nested Structure
    const organizeComments = (comments) => {
        const commentMap = {}; // Store comments by ID

        // Initialize all comments
        comments.forEach(comment => {
            commentMap[comment._id] = { ...comment, replies: [] , showReplyInput: false }
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

    // Fetching comments and replies
    useEffect(() => { // Runs when slug changes OR user posts a new comment
        if (!slug) return;

        const controller = new AbortController()
        const { signal } = controller

        const fetchComments = async () => {
            setCommentLoading(true)
            setComments([])

            try {
                const commentsData = await getComments(signal)
                if (commentsData && commentsData.length > 0) {
                    setComments(commentsData)

                    const addShowReplyInput = commentsData.map(comment => {
                        return { id: comment._id, showReply: false }
                    })
                    setReplyStatus(addShowReplyInput)

                    // initialize viewReply at the first render
                    if (viewReply.length === 0) { // when url changes, viewReply will reset to an empty array
                        const initialViewReply = commentsData.map(comment => {
                            return { id: comment._id, viewReply: false }
                        })
                        setViewReply(initialViewReply)
                    }
                    // update viewReply with current status
                    if (viewReply.length > 0) {
                        setViewReply(prev => {
                            const newComment = commentsData[commentsData.length - 1] // the new comment is the last sorted by createdAt in Comments model
                            return [ ...prev, { id: newComment._id, viewReply: false }]
                        })
                    }
                }   
            } catch (error) {
                console.error("Error fetching comments:", error)
            } finally {
                setCommentLoading(false)
            }
        }

        fetchComments()
        return () => controller.abort()
        // eslint-disable-next-line 
    }, [slug, commentTrigger]) 

    // Restore scroll position when creating or deleting a comment
        // Save scroll position before comment update
    useEffect(() => {
        scrollPositionRef.current = window.scrollY
    }, [commentTrigger])

        // Restore scroll position
    useEffect(() => {
        setTimeout(() => {
            requestAnimationFrame(() => {
                if (document.querySelectorAll(".comment-container").length > 0) {
                    window.scrollTo({ top: scrollPositionRef.current, behavior: "instant" })
                }
            })
        }, 50)
    }, [comments])

    // click anywhere to close setting tabs
    const outOfFocus = (e) => {
        // Blog setting tab
        if (showOptions) {
            if (!e.target.classList.contains("edit") && !e.target.classList.contains("delete") && !e.target.classList.contains("confirm-container")){
                setShowOptions(false)
            }
        }
        if (showModal) {
            if (!e.target.classList.contains("confirm-container")) {
                setShowModal(false)
            }
        }
    }

    // Close comment's setting button when clicking anywhere outside of it
    const handleClickOutSide = (e) => {
        if (!showCommentOption) return // Exit early if no menu is open

        // Check if the clicked element is not delete button and not the setting icon where has its own open-close handling
        if (!e.target.classList.contains("delete") && !e.target.closest(".setting-icon") && !e.target.closest(".ModalComment")) { // exclude ModalComment condition since we will write condition separately below
            setShowCommentOption(null)
        }   
        // Handle clicking when modal appears
        if (e.target.classList.contains("modal") || e.target.classList.contains("cancel-button")) {
            setShowCommentOption(null)
            setShowCommentModal(null)
        }
    }
    useEffect(() => {
        document.addEventListener("click", handleClickOutSide)
        return () => document.removeEventListener("click", handleClickOutSide)
        // eslint-disable-next-line
    }, [showCommentOption])

    // Function to toggle comment's delete button
    const toggleCommentOption = (commentId) => {
        setShowCommentOption(prev => (prev === commentId ? null : commentId))
    }


    // Delete Blog
    const deleteBlog = (slug) => {
        setLoading(true)
        axios.delete(`${process.env.REACT_APP_API}/blog/${slug}`, { withCredentials: true })
        .then(response => {
            setAlertState({ display: true, type: "success", message: response.data.message })
            navigate(`/profile/${user}`)
        })
        .catch(err => {
            console.error(err)
            setAlertState({ display: true, type: "error", message: err.response.data.message })
        })
        .finally(() => {
            setLoading(false)
        })
    }

    const showComment = () => {
        setReplyStatus(prev => prev.map(comment => {
            return { ...comment, showReply: false }
        }))
        setShowCommentInput(!showCommentInput)
    }
    // Show only clicked reply input (fold others which were shown before)
    const showReplyInput = (commentId) => {
        setShowCommentInput(false) // if comment input still unfolds, fold it
        setReplyStatus(prev => prev.map(comment => {
            if (comment.id === commentId) {
                if (comment.showReply) return { ...comment, showReply: false} // when clicking the same reply button which already unfolds, then fold it
                return { ...comment, showReply: true }
            }
            return { ...comment, showReply: false }
        }))
    }

    // Create a comment and reply
    const onSendComment = (commentContent, parentCommentId = null) => {
        setCommentLoading(true)
        axios.post(`${process.env.REACT_APP_API}/blog/${slug}/comment`, 
            { content: commentContent,
              parentCommentId: parentCommentId || null
            },
            { withCredentials: true }
        )
        .then(response => {
            setAlertState({ display: true, type: "success", message: response.data.message })
            setCommentTrigger(prev => !prev) // Toggle trigger to refresh comment
            // Automatically show reply the user has just created
            if (parentCommentId) {
                return setViewReply(prev => prev.map(element => {
                    if (element.id === parentCommentId) return { ...element, viewReply: true }
                    return element
                }))
            }
        })
        .catch(error => {
            console.error(error.response?.data.error)
        })
        .finally(() => {
            setShowCommentInput(false)
            setReplyStatus(prev => prev.map(element => {
                return { ...element, showReply: false }
            }))
            // set commentLoading = false in useEffect when the new comment has been loaded successfully
            // if setCommentLoading(false) inside finally: it will run immediately after the request finishes, there might be a brief moment where the UI updates before the fresh comments are fetched. This could result in flickering or an incorrect UI state where the new comment doesn't appear right away.
        })
    }

    // Recursive function (find target comment's ID in nested structure)
    // eslint-disable-next-line
    const findTargetId = (nestedStructure, targetId) => {
        for (const element of nestedStructure) {
            if (element._id === targetId) { // Base case (found on top level)
                return element;
            }
            if (element.replies.length !== 0) { // Be able to go deeper -> recursively call
                const found = findTargetId(element.replies, targetId)
                if (found) return found;
            }
        }
        return false
    }

    // Recursive Function (get comment's ID and all nested replies)
    const getAllRelatedReplies = (nestedStructure, targetId) => {
        let result = [];
        for (const element of nestedStructure) {
            if (element._id === targetId) {
                result.push(element._id) // Add the target comment itself
    
                // Recursive function to collect all nested replies
                const collectAllReplies = (repliesArray) => {
                    let nestedReplies = [];
                    for (const element of repliesArray) {
                        nestedReplies.push(element._id) // Add the reply's ID

                        if (element.replies.length > 0) {
                            nestedReplies.push(...collectAllReplies(element.replies)) // Recursively collect more
                        }
                    }
                    return nestedReplies;
                }
    
                if (element.replies.length > 0) {
                    result.push(...collectAllReplies(element.replies))
                }
                return result; // Return once the target ID and all its replies are found
            }
            if (element.replies.length > 0) {
                const recursiveResult = getAllRelatedReplies(element.replies, targetId)
                result.push(...recursiveResult)
            }
        }
        return result
    }

    // ToolTip for not logged in users when hovering add comment button
    const toggleCommentToolTip = (section) => {
        setShowCommentToolTip(section)
    }


    if (blogExists === null) return <LoadingScreen />
    if (blogExists === false) return <NotFound />
    if (blogExists && blog) {
        return(
            <>
                <div className="BlogComponent" onClick={outOfFocus}>
                    {blog && 
                    <div>
                        <header>
                            <div className="goback-icon" onClick={()=>navigate("/")}> {/* display on mobile screen for easily go back without clicking menu icon then community page */}
                                <IoChevronBackOutline />
                            </div>
                            <h1 className={`title ${showOptions ? "overlay" : ""}`}>{blog.title}</h1>
                            { user === blog.author ?
                                <div className="setting">
                                    <BiDotsHorizontalRounded onClick={()=>setShowOptions(!showOptions)}/>
                                    {showOptions && 
                                        <ul className="options">
                                            <Link to={`/blog/edit/${blog.slug}`} className="edit"><li>Edit</li></Link>
                                            <li className="delete" onClick={()=>setShowModal(true)}>Delete</li>    
                                        </ul>
                                    }
                                    {showModal && <ModalConfirm showModal={showModal} setShowModal={setShowModal} title={blog.title}
                                    deleteBlog={deleteBlog} slug={slug}/>}
                                </div>
                                : null
                            }
                        </header>
                        <main className="TipTap-Result">
                            {parser(blog.content)}
                        </main>
                        <footer>
                            <Link to={`/profile/${blog.author}`} className="author">
                                {blog.author}
                            </Link>
                            <span className="timestamp"
                                onMouseEnter={() => setShowDateToolTip(true)}
                                onMouseLeave={() => setShowDateToolTip(false)}
                            >
                                {formatCommentTime(blog.createdAt)}
                                <div className={`tooltip ${showDateToolTip ? "show" : ""}`}>
                                    {showFullDateTime(blog.createdAt)}
                                </div>
                            </span>
                        </footer>       
                    </div>}
                    <section className="blog-comment">
                        { (user && isAuthenticated)
                        ?   <div>
                                <button className={showCommentInput ? "comment-button active" : "comment-button"} onClick={showComment}>
                                    <span className="comment-icon">
                                        { !showCommentInput ? <LuCirclePlus /> : <LuCircleMinus />}
                                    </span>
                                    <span>Comment</span>
                                </button>
                                { showCommentInput && <CommentInput onSendComment={onSendComment} />}
                            </div>
                        :   <button className="comment-button disable"
                                onMouseEnter={() => toggleCommentToolTip("comment")}
                                onMouseLeave={() => setShowCommentToolTip(null)}   
                            >
                                <span className="comment-icon">
                                    <LuCirclePlus />
                                </span>
                                <span>
                                    <p>Comment</p>
                                    <div className={`tooltip ${showCommentToolTip === "comment" ? "show" : ""}`}>
                                        <p>Join the conversation! Log in to share your thoughts</p>
                                    </div>
                                </span>
                            </button>
                        }
                    </section>
                    <section className="comments" id="comments">
                            {organizeComments(comments).map((comment)=>{
                                // filter to get individual reply status as { id, showReply } then map to get only showReply returning in an array, so destructuring to get boolean
                                const [ individualReplyStatus ] = replyStatus.filter(element => element.id === comment._id).map(element => element.showReply)
                                return <CommentComponent key={comment._id} 
                                            // Comment and Reply Content
                                            comment={comment}
                                            replies={comment.replies}

                                            // Show / Hide Reply Input
                                            showReplyInput={showReplyInput} 
                                            individualReplyStatus={individualReplyStatus}
                                            replyStatus={replyStatus} // for nested replies}
                                            nestedStructure={organizeComments(comments)}
                                            getAllRelatedReplies={getAllRelatedReplies}

                                            blogAuthor={blog.author} // just in case author writes a comment or reply, then show "author" next to username
                                            // Create a Reply
                                            onSendComment={onSendComment}

                                            // Delete Button and Modal
                                            showCommentOption={showCommentOption}
                                            toggleCommentOption={toggleCommentOption}
                                            showCommentModal={showCommentModal}
                                            setShowCommentModal={setShowCommentModal}
                                            setCommentTrigger={setCommentTrigger}
                                        />
                            })}
                    </section>
                    { commentLoading === true && <LoadingScreen /> }
                </div>
                <footer className="copyright">
                    <small>&copy; 2025 Pitipat Pattamawilai. All Rights Reserved.</small>
                </footer>
            </>
        )
    }
}

export default BlogComponent

// © 2025 Pitipat Pattamawilai. All Rights Reserved.