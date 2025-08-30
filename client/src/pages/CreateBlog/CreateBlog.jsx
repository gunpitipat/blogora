import "./CreateBlog.css"
import axios from "axios"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useBlocker } from "react-router-dom";
import { useAlertContext } from "../../contexts/AlertContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { useLoadingContext } from "../../contexts/LoadingContext"
import { cleanEditorContent } from "../../utils/contentUtils";
import { debounce } from "lodash"
import ContentEditor from "../../components/TextEditor/ContentEditor";
import BlogFormButtons from "../../components/BlogFormButtons/BlogFormButtons";
import Modal from "../../components/Modals/Modal";
import PopupAlert from "../../components/Popups/PopupAlert";
import { FaPen } from "react-icons/fa";

const CreateBlog = () => {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState(null) // null for initializing TipTap

    const initialLabels = useMemo(() => ({ titleLabel: false, contentLabel: false }), [])
    const [labels, setLabels] = useState(initialLabels)

    // Save Draft
    const [isUnsaved, setIsUnsaved] = useState(false) // Track whether the user has unsaved work
    const [pendingNavigation, setPendingNavigation] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [forceNavigate, setForceNavigate] = useState(false) // Disable navigation blocker to allow navigate() when posted successfully
    const blocker = useBlocker(isUnsaved && !forceNavigate) // Intercept navigation and warn the user if they have unsaved changes
    
    // Preview
    const [previewOpen, setPreviewOpen] = useState(false)
    const [showPopupAlert, setShowPopupAlert] = useState(false)
    const previewWindowRef = useRef(null)
    
    // Pass to TipTap component to clear content after submitting form
    const [submit, setSubmit] = useState(false)
        
    const { setLoading } = useLoadingContext()
    const { user } = useAuthContext()
    const { setAlertState } = useAlertContext()
    const navigate = useNavigate()

    const saveDraft = (title, content) => {
        localStorage.setItem("blogDraft", JSON.stringify({ title, content, author: user?.username }))
        setIsUnsaved(false)
        setAlertState({ display: true, type: "success", message: "Draft saved successfully." })
    }

    // Initialize content (TipTap) / Restore the draft
    useEffect(() => {
        if (!user?.username) return

        const saved = localStorage.getItem("blogDraft")
        if (!saved) {
            setContent("")
            return
        }

        try {
            const draft = JSON.parse(saved)
            if (draft && draft.author === user.username) {
                setTitle(draft.title || "")
                setContent(draft.content || "")
            } else {
                localStorage.removeItem("blogDraft") // Prevent one user's draft from leaking to another's session
                setContent("")
            }

        } catch {
            localStorage.removeItem("blogDraft") // In case of corrupted JSON
            setContent("")
        }
    }, [user?.username])

    // Track unsaved changes
    const updateUnsaved = useMemo(() => {
        return debounce(() => {
            const saved = localStorage.getItem("blogDraft")
            let draft = { title: "", content: "", author: user?.username }

            if (saved) {
                try {
                    const parsed = JSON.parse(saved)
                    if (parsed && parsed.author === user?.username) draft = parsed

                } catch {
                    // Ignore corrupted draft
                }
            }

            const isChanged = title !== draft.title || content !== draft.content
            setIsUnsaved(isChanged)
        }, 300)
    }, [title, content, user?.username])

    useEffect(() => {
        updateUnsaved()
        return () => updateUnsaved.cancel() // Cancel debounce on unmount
    }, [updateUnsaved])

    // Warn the user before closing or reloading the tab if they have unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!isUnsaved) return

            setShowModal(false)
            e.preventDefault()
            e.returnValue = "" // Trigger native browser confirmation
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isUnsaved])

    // Warn the user before navigating away if they have unsaved changes
    useEffect(() => {
        if (blocker.state === "blocked") {
            setPendingNavigation(blocker) // Store blocker object to call its methods later
            setShowModal(true)
        }
    }, [blocker])

    // Modal button handlers
    const handleModalConfirm = useCallback(() => {
        pendingNavigation?.proceed() // Continue navigation
        setShowModal(false)
        setPendingNavigation(null)
    }, [pendingNavigation])

    const handleModalCancel = useCallback(() => {
        pendingNavigation?.reset()
        setShowModal(false)
        setPendingNavigation(null)
    }, [pendingNavigation])

    // Make label bolder when focusing on input/textarea
    const focusLabel = (label) => {
        setLabels(prev => ({ ...prev, [label]: true }))
    }

    // Create stable functions to pass to memoized child components
    const handleFocus = useCallback(() => {
        focusLabel("contentLabel")
    }, [])

    const handleBlur = useCallback(() => {
        setLabels(initialLabels)
    }, [initialLabels])

    const handleSaveDraft = useCallback(() => {
        saveDraft(title, content)
        // eslint-disable-next-line 
    }, [title, content])

    // Submit data
    const handleFormSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setForceNavigate(true)
        try {
            const cleanedContent = cleanEditorContent(content)
            const response = await axios.post(`${process.env.REACT_APP_API}/create`, { title, content: cleanedContent }, { withCredentials: true })
            setTitle("")
            setContent("")
            setSubmit(true)
            setIsUnsaved(false)
            localStorage.removeItem("blogDraft")
            setLoading(false)
            setAlertState({ display: true, type: "success", message: response.data.message })
            navigate(`/profile/${user.username}`)
        
        } catch (error) {
            setForceNavigate(false) // Re-enable navigation blocker
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

    return(
        <div className="create-blog">
            <h2 className="headline">
                Create Your Blog
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
                    firstBtnLabel="Save Draft"
                    onFirstClick={handleSaveDraft}
                    previewOpen={previewOpen}
                    previewBlog={previewBlog}
                    thirdBtnLabel="Post"
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

            {/* When leaving the page with unsaved changes */}
            <Modal
                showModal={showModal}
                action="Leave"
                cancelLabel="Stay"
                title="Unsaved Draft"
                content={
                    <p>You have unsaved changes. If you leave now, your draft will be lost.</p>
                }
                onConfirm={handleModalConfirm}
                onCancel={handleModalCancel}
            />
        </div>
    )
}

export default CreateBlog

// © 2025 Pitipat Pattamawilai. All Rights Reserved.