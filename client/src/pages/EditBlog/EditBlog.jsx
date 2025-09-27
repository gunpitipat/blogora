import "./EditBlog.css"
import api from "../../utils/api"
import axios from "axios"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Navigate, useParams } from "react-router-dom"
import { useAlertContext } from "../../contexts/AlertContext"
import { useAuthContext } from "../../contexts/AuthContext"
import { useLoadingContext } from "../../contexts/LoadingContext" 
import { cleanEditorContent } from "../../utils/contentUtils"
import { debounce } from "lodash"
import NotFound from "../NotFound/NotFound"
import ContentEditor from "../../components/TextEditor/ContentEditor";
import BlogFormButtons from "../../components/BlogFormButtons/BlogFormButtons"
import PopupAlert from "../../components/Popups/PopupAlert";
import { FaPen } from "react-icons/fa";

const EditBlog = () => {
    const { slug } = useParams()
    const [title, setTitle] = useState("")
    const [content, setContent] = useState(null)
    const [blogExists, setBlogExists] = useState(null)
    const [author, setAuthor] = useState(null)

    const initialLabels = useMemo(() => ({ titleLabel: false, contentLabel: false }), [])
    const [labels, setLabels] = useState(initialLabels) 

    // Preview
    const [previewOpen, setPreviewOpen] = useState(false)
    const [showPopupAlert, setShowPopupAlert] = useState(false)
    const previewWindowRef = useRef(null)

    // Pass to TipTap component to clear content after submitting form
    const [submit, setSubmit] = useState(false)

    const { setLoading } = useLoadingContext()
    const { user } = useAuthContext()
    const { setAlertState } = useAlertContext()

    // Make label bolder when focusing on input/textarea   
    const focusLabel =(label) => {
        setLabels(prev => ({ ...prev, [label]: true }))
    }

    // Create stable functions to pass to memoized child components
    const handleFocus = useCallback(() => {
        focusLabel("contentLabel")
    }, [])

    const handleBlur = useCallback(() => {
        setLabels(initialLabels)
    }, [initialLabels])

    const handleDiscard = useCallback(() => {
        window.history.back()
    }, [])
    
    useEffect(() => {
        const controller = new AbortController()

        const fetchBlog = async () => {
            try {
                setBlogExists(null)
                setTitle("")
                setContent(null)
                setAuthor(null)

                const response = await api.get(`/blog/${slug}`, { signal: controller.signal })

                const { title: titleData, content: contentData, author: authorId } = response.data
                setTitle(titleData)
                setContent(contentData)
                setBlogExists(true)
                setAuthor(authorId?.username)
            
            } catch (error) {
                if (axios.isCancel(error)) return
                if (error.response && error.response.status === 404) {
                    setBlogExists(false) // Blog not found
                } else {
                    setAlertState({ display: true, type: "error", message: error.response?.data?.message || "Something went wrong. Please try again." })
                    setBlogExists(false)
                }
            }
        }

        fetchBlog()

        return () => controller.abort()
        // eslint-disable-next-line 
    }, [slug])

    // Submit data
    const handleFormSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const cleanedContent = cleanEditorContent(content)
            const response = await api.put(`/blog/${slug}`,{ title, content: cleanedContent })
            setLoading(false)
            setAlertState({ display: true, type: "success", message: response.data.message })
            window.history.back() // Go back to BlogPage
        
        } catch (error) {
            if (!error.response) {
                setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
            } else {
                setAlertState({ display: true, type: "error", message: error.response.data?.message || "Something went wrong. Please try again." })
            }
        
        } finally {
            setLoading(false)
        }
    }

    // Preview Feature
    // Preview button hanlder
    const previewBlog = useCallback(() => {
        // Open a new tab if window reference is null or inaccessible, or the latest preview is closed
        if (!previewWindowRef.current || previewWindowRef.current.closed) {  
            const cleanedContent = cleanEditorContent(content)
            localStorage.setItem("previewData", JSON.stringify({ title, content: cleanedContent }))
            const slug = Date.now().toString()
            localStorage.setItem("formSync", slug)
    
            const previewWindow = window.open(`/preview/${slug}`, "_blank")
            if (!previewWindow) {
                setShowPopupAlert(true)
                setAlertState({ display: true, type: "error", message: "Preview couldn't open." })
            } else {
                previewWindowRef.current = previewWindow
            }
        // Close the preview if window reference is valid and the tab is still open
        } else {
            previewWindowRef.current.close()
            setPreviewOpen(false)
        }
        // eslint-disable-next-line 
    }, [title, content])

    // Track if preview tab is open and controllable
    useEffect(() => {
        let previewTimeout;

        // Handle preview connectivity
        const handleStorageChange = (event) => {
            if (event.key !== "previewOpen") return

            clearTimeout(previewTimeout);
            previewTimeout = setTimeout(() => {
                let result;
                if (previewWindowRef.current && !previewWindowRef.current.closed) {
                    try {
                        // Preview is navigated away within the same origin
                        if (previewWindowRef.current.location.pathname.split("/").pop() !== localStorage.getItem("formSync")) {
                            result = false
                        } else {
                            if (event.newValue === "true") {
                                result = true
                            } else if (event.newValue === "false") {
                                return // Preview is just refreshed
                            }
                        }

                    // If preview is navigated away to an external domain, accessing pathname in windowRef will throw an error
                    } catch (error) {
                        result = false
                    }
                } else {
                    if (event.newValue === "false") { // Preview is manually closed
                        result = false
                    }
                }
                
                if (result) {
                    setPreviewOpen(true)
                } else {
                    setPreviewOpen(false)
                    localStorage.removeItem("previewOpen")
                    localStorage.removeItem("previewData")
                    localStorage.removeItem("formSync")
                    previewWindowRef.current = null
                }
            }, 50) // Ensure previewWindowRef.current.closed updates
        }

        window.addEventListener("storage", handleStorageChange)
        return () => window.removeEventListener("storage", handleStorageChange)
        // eslint-disable-next-line
    }, [])

    // Update localStorage when title or content changes
    const deboundedUpdate = useMemo( // Memoize a returned function from debounce
        () => debounce((title, content) => {
                if (previewOpen) { // Only update when preview is open
                    const cleanedContent = cleanEditorContent(content)
                    localStorage.setItem("previewData", JSON.stringify({ title, content: cleanedContent }))
                }
            }, 100),
        [previewOpen]
    )

    useEffect(() => {
        deboundedUpdate(title, content)
    }, [title, content, deboundedUpdate])

    // Clean up localStorage
    useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.removeItem("previewData")
            localStorage.removeItem("formSync")
            localStorage.removeItem("previewOpen")
        }

        window.addEventListener("beforeunload", handleBeforeUnload) // Clear when closing or refreshing
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
            // In case of internal navigation
            localStorage.removeItem("previewData")
            localStorage.removeItem("formSync")
            localStorage.removeItem("previewOpen")
        }
    }, [])

    useEffect(() => {
        setLoading(blogExists === null)
        // eslint-disable-next-line
    }, [blogExists])

    return (
        <>
            { blogExists === false && <NotFound /> }

            { author !== null && user?.username !== author &&
                <Navigate to={`/blog/${slug}`} />
            }
   
            {   blogExists && 
                author === user?.username && 
                content !== null &&
                
                    <div className="edit-blog">
                        <h2 className="headline">
                            Edit Your Blog
                        </h2>
                        <form onSubmit={handleFormSubmit}>
                            <div className="title-editor">
                                <label className={`form-label ${labels.titleLabel ? "active" : ""}`}>
                                    Title
                                    { labels.titleLabel && 
                                        <span className="pen-icon">
                                            <FaPen />
                                        </span>
                                    }
                                </label>
                                <input 
                                    type="text" 
                                    value={title} 
                                    onFocus={() => focusLabel("titleLabel")}
                                    onBlur={() => setLabels(initialLabels)}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <ContentEditor 
                                content={content}
                                setContent={setContent}
                                submit={submit} 
                                setSubmit={setSubmit}
                                isLabelActive={labels.contentLabel}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />
                            <BlogFormButtons 
                                firstBtnLabel="Discard"
                                onFirstClick={handleDiscard}
                                previewOpen={previewOpen}
                                previewBlog={previewBlog}
                                thirdBtnLabel="Update"  
                            />
                        </form>

                        {/* If preview couldn't open */}
                        { showPopupAlert && 
                            <PopupAlert
                                popupContent={`Please allow pop-ups for this site in your browser settings to use the preview feature.`}
                                showPopupAlert={showPopupAlert}
                                setShowPopupAlert={setShowPopupAlert}
                            />
                        } 
                    </div>
            }
        </>
    )
}

export default EditBlog

// © 2025 Pitipat Pattamawilai. All Rights Reserved.