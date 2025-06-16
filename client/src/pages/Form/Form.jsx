import "./Form.css"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FaPen, FaEye } from "react-icons/fa";
import axios from "axios"
import { TfiArrowsCorner } from "react-icons/tfi";
import { BsArrowsAngleContract } from "react-icons/bs";
import { useAlertContext } from "../../contexts/AlertContext";
import TipTap from "../../components/RichTextEditor/TipTap";
import { useLoadingContext } from "../../contexts/LoadingContext"
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigate, useBlocker } from "react-router-dom";
import { getTotalOffsetTop } from "../../utils/layoutUtils";
import { FaUpRightFromSquare, FaPenToSquare } from "react-icons/fa6";
import { debounce } from "lodash"
import PopupAlert from "../../components/Popups/PopupAlert";
import { cleanEditorContent } from "../../utils/contentUtils";
import Modal from "../../components/Modals/Modal";

const Form = ()=>{
    const [ title, setTitle ] = useState("")
    const [ content, setContent ] = useState(null)

    let initialLabels = { titleLabel: false, contentLabel: false }
    const [ labels, setLabels ] = useState(initialLabels) 

    // Preview
    const [ previewOpen, setPreviewOpen ] = useState(false)
    const [ showPopupAlert, setShowPopupAlert ] = useState(false)
    const previewWindowRef = useRef(null)
    
    // Prop to TipTap component to clear content after submitting form
    const [ submit, setSubmit ] = useState(false)
        
    const { setLoading } = useLoadingContext()
    const { user } = useAuthContext()
    const navigate = useNavigate()

    // Alert popup
    const { setAlertState } = useAlertContext()

    // Extend textarea
    const [ extendTextarea, setExtendTextarea ] = useState(false)

    // Save Draft
    const [ isUnsaved, setIsUnsaved ] = useState(false) // Track whether the user has unsaved work
    const [ pendingNavigation, setPendingNavigation ] = useState(null)
    const [ showModal, setShowModal ] = useState(false)
    const [ forceNavigate, setForceNavigate ] = useState(false) // Disable navigation blocker to allow navigate() when posted successfully

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
        // eslint-disable-next-line
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

    // Intercept navigation and warn the user if they have unsaved changes
    const blocker = useBlocker(isUnsaved && !forceNavigate)

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
        initialLabels = { ...initialLabels, [label]: true }
        setLabels(initialLabels) // Updating labels causes a re-render, resetting initialLabels to its initial value
    }

    // Perform scrolling after extendTextarea set to true (the DOM updates)
    useEffect(() => {
        if (extendTextarea) {
            const contentElement = document.getElementById("content")
            const editorElement = document.getElementById("text-editor")
                
            if (contentElement && editorElement) { // Ensure contentElement not null and valid to prevent Reference Error
                const handleTransitionEnd = ()=> {    
                    const targetScrollY = getTotalOffsetTop(contentElement) - (window.innerWidth <= 768 ? 0 : 80) - (window.innerWidth <= 768 ? 20 : 16) // - fixed navbar height - spacing
                    window.scrollTo({
                        top: targetScrollY,
                        behavior: "smooth"
                    })
                }

                // Textarea (text editor) has height-transition duration of 150ms
                editorElement.addEventListener("transitionend",handleTransitionEnd)

                // Cleanup: Remove the listener to prevent multiple event listeners from stacking up
                return () => {
                    editorElement.removeEventListener("transitionend", handleTransitionEnd);
                };
            }
        }
    }, [extendTextarea])

    // Submit form data
    const submitForm = async (e) => {
        e.preventDefault()
        setLoading(true)
        setForceNavigate(true)
        try {
            const cleanedContent = cleanEditorContent(content)
            const response = await axios.post(`${process.env.REACT_APP_API}/create`, { title, content: cleanedContent }, { withCredentials: true })
            setTitle("")
            setContent("")
            setSubmit(true)
            setExtendTextarea(false)
            setIsUnsaved(false)
            localStorage.removeItem("blogDraft")
            setLoading(false)
            setAlertState({ display: true, type: "success", message: response.data.message })
            navigate(`/profile/${user.username}`)
        } catch (error) {
            setLoading(false)
            setForceNavigate(false) // Re-enable navigation blocker
            if (!error.response) {
                setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
            } else {
                setAlertState({ display: true, type: "error", message: error.response.data?.message || "Something went wrong. Please try again." })
            }
        }
    }

    // Preview Feature
    // Preview button hanlder
    const previewBlog = () => {
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
    }

    // Track if preview tab is open and controllable
    useEffect(() => {
        // Handle preview connectivity
        const handleStorageChange = (event) => {
            if (event.key === "previewOpen") {
                let result;
                setTimeout(() => {
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
                        } catch (error) { // Preview is navigated away to an external domain
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
        <div className="Form">
            <h2>Create Your Blog</h2>
            <form onSubmit={submitForm}>
                <div className="title">
                    <label className={labels.titleLabel ? "bold" : null}>
                        Title <FaPen visibility={labels.titleLabel ? "visible" : "hidden"}/>
                    </label>
                    <input type="text" value={title} 
                        onFocus={() => focusLabel("titleLabel")}
                        onBlur={() => setLabels(initialLabels)}
                        onChange={(e) => setTitle(e.target.value)}/>
                </div>
                <div className="content" id="content">
                    <label className={labels.contentLabel ? "bold" : null}>
                        Content <FaPen visibility={labels.contentLabel ? "visible":"hidden"}/>
                    </label>
                    <div className={extendTextarea ? "textarea-container extend" : "textarea-container"}>
                        {content !== null && (
                            <TipTap 
                                content={content} 
                                setContent={setContent} 
                                submit={submit} 
                                setSubmit={setSubmit} 
                                isFocusing={labels.contentLabel}
                                onFocus={() => focusLabel("contentLabel")}
                                onBlur={() => setLabels(initialLabels)}
                            />                 
                        )}
                        <div className="sizing" onClick={() => setExtendTextarea(!extendTextarea)}>
                            { !extendTextarea ? <TfiArrowsCorner/> : <BsArrowsAngleContract style={{ transform: "scaleX(-1)" }}/>}
                        </div>
                    </div>
                </div>
                <footer className="button-group">
                    <button className="btn savedraft" type="button" onClick={() => saveDraft(title, content)}>
                        <span className="icon">
                            <FaPenToSquare />
                        </span>
                        <label>Save Draft</label>
                    </button>
                    <button className={`btn preview ${previewOpen ? "previewing" : ""}`} type="button" onClick={previewBlog}>
                        {!previewOpen &&
                        <span className="icon">
                            <FaUpRightFromSquare />
                            <FaEye className="eye" />
                        </span>
                        }
                        <label>{!previewOpen ? "Preview" : "Previewing"}</label>
                    </button>
                    <button className="btn post" type="submit">
                        <span className="icon">
                            <FaUpRightFromSquare />
                        </span>
                        <label>Post</label>
                    </button>
                </footer>    
            </form>
            
            {/* If preview couldn't open */}
            {showPopupAlert && 
                <PopupAlert
                    popupContent={`Please allow pop-ups for this site in your browser settings to use the preview feature.`}
                    showPopupAlert={showPopupAlert}
                    setShowPopupAlert={setShowPopupAlert}
                />
            } 

            {/* When leaving the page with unsaved changes */}
            <Modal
                showModal={showModal}
                setShowModal={setShowModal}
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

export default Form

// © 2025 Pitipat Pattamawilai. All Rights Reserved.