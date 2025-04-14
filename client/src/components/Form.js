import "./Form.css"
import { useEffect, useMemo, useRef, useState } from "react"
import { FaPen, FaEye } from "react-icons/fa";
import axios from "axios"
import { TfiArrowsCorner } from "react-icons/tfi";
import { BsArrowsAngleContract } from "react-icons/bs";
import { useAlertContext } from "../utils/AlertContext";
import TipTap from "./TipTap";
import { useLoadingContext } from "../utils/LoadingContext"
import { useAuthContext } from "../utils/AuthContext";
import { useNavigate } from "react-router-dom";
import { getTotalOffsetTop } from "../utils/layoutUtils";
import { FaUpRightFromSquare, FaPenToSquare } from "react-icons/fa6";
import { debounce } from "lodash"
import PopUpAlert from "./PopUpAlert";

const Form = ()=>{
    const [ title, setTitle ] = useState("")

    const [ content, setContent ] = useState(() => {
        const data = localStorage.getItem("save_draft")
        return data ? JSON.parse(data).content : ""
    })

    // Preview
    const [ previewOpen, setPreviewOpen ] = useState(false)
    const [ showPopUpAlert, setShowPopUpAlert ] = useState(false)
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
    const savingDraftFunc = (title, content) => {
        const data = { title, content }
        localStorage.setItem("save_draft", JSON.stringify(data))
        setAlertState({ display: true, type: "success", message: "Draft saved successfully." })
    }

    useEffect(() => {
        // In case of saving draft
        if (localStorage.getItem("save_draft")) { // { title: "your title", content: "your content" }
            const saveDraft = JSON.parse(localStorage.getItem("save_draft"))
            setTitle(saveDraft.title)
            setContent(saveDraft.content)
        }
        // eslint-disable-next-line
    }, [])

    // Style: Making label bolder when focusing on input/textarea 
    let initialLabels = { titleLabel: false, contentLabel: false }
    const [ labels, setLabels ] = useState(initialLabels)   
    const focusLabelFunc = (label) => {
        initialLabels = { ...initialLabels, [label]: true }
        setLabels(initialLabels) // Updating labels causes a re-render, resetting initialLabels to its initial value
    }
    // Style: Click anywhere to stop focusing on text field
    const outOfFocus = (e) => {
        if (e.target.nodeName !== "INPUT") {
            setLabels(initialLabels)
        }
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
    const submitForm = (e) => {
        e.preventDefault()
        setLoading(true)
        axios.post(`${process.env.REACT_APP_API}/create`, { title, content }, { withCredentials: true })
        .then(response => {
            setTitle("")
            setContent("")
            setSubmit(true)
            setExtendTextarea(false)
            setAlertState({ display: true, type: "success", message: response.data.message })
            localStorage.removeItem("save_draft")
            navigate(`/profile/${user.username}`)
        })
        .catch(error => {
            if (!error.response) {
                setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
            } else {
                setAlertState({ display: true, type: "error", message: error.response.data?.message || "Something went wrong. Please try again." })
            }
        })
        .finally(() => {
            setLoading(false)
        })
    }

    // Preview Feature
    // Preview button hanlder
    const previewBlog = () => {
        // Open a new tab if window reference is null or inaccessible, or the latest preview is closed
        if (!previewWindowRef.current || previewWindowRef.current.closed) {    
            localStorage.setItem("previewData", JSON.stringify({ title, content }))
            const slug = Date.now().toString()
            localStorage.setItem("formSync", slug)
    
            const previewWindow = window.open(`/preview/${slug}`, "_blank")
            if (!previewWindow) {
                setShowPopUpAlert(true)
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
                    localStorage.setItem("previewData", JSON.stringify({ title, content }))
                }
            }, 500),
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
        <div className="Form" onClick={outOfFocus}>
            <h2>Create Your Blog</h2>
            <form onSubmit={submitForm}>
                <div className="title">
                    <label className={labels.titleLabel? "bold" : null}>
                        Title <FaPen visibility={labels.titleLabel? "visible":"hidden"}/>
                    </label>
                    <input type="text" value={title} onFocus={()=>focusLabelFunc("titleLabel")}
                        onChange={(e)=>setTitle(e.target.value)}/>
                </div>
                <div className="content" id="content">
                    <label className={labels.contentLabel? "bold" : null}>
                        Content <FaPen visibility={labels.contentLabel? "visible":"hidden"}/>
                    </label>
                    <div className={extendTextarea ? "textarea-container extend" : "textarea-container"}>
                        <div onClick={()=>focusLabelFunc("contentLabel")}>
                            <TipTap content={content} setContent={setContent} submit={submit} setSubmit={setSubmit} contentLabel={labels.contentLabel}/>                 
                            <div className="sizing" onClick={()=>setExtendTextarea(!extendTextarea)}>
                                { !extendTextarea ? <TfiArrowsCorner/> : <BsArrowsAngleContract style={{transform:"scaleX(-1)"}}/>}
                            </div>
                        </div>
                    </div>
                </div>
                <footer className="button-group">
                    <button className="btn savedraft" type="button" onClick={()=>savingDraftFunc(title,content)}>
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
            {showPopUpAlert && 
                <PopUpAlert
                    popUpContent={`Please allow pop-ups for this site in your browser settings to use the preview feature.`}
                    showPopUpAlert={showPopUpAlert}
                    setShowPopUpAlert={setShowPopUpAlert}
                />
            } 
        </div>
    )
}

export default Form

// © 2025 Pitipat Pattamawilai. All Rights Reserved.