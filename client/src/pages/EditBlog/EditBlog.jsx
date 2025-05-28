import { useState, useEffect, useRef, useMemo } from "react"
import "./EditBlog.css"
import { Navigate, useParams } from "react-router-dom"
import axios from "axios"
import { useAlertContext } from "../../contexts/AlertContext"
import { FaPen, FaEye } from "react-icons/fa";
import { TfiArrowsCorner } from "react-icons/tfi";
import { BsArrowsAngleContract } from "react-icons/bs";
import TipTap from "../../components/RichTextEditor/TipTap"
import { useLoadingContext } from "../../contexts/LoadingContext" 
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen"
import NotFound from "../NotFound/NotFound"
import { useAuthContext } from "../../contexts/AuthContext"
import { getTotalOffsetTop } from "../../utils/layoutUtils"
import { FaUpRightFromSquare, FaBan } from "react-icons/fa6";
import { debounce } from "lodash"
import PopupAlert from "../../components/Popups/PopupAlert";

const EditBlog = () => {
    const { slug } = useParams()

    const [ title, setTitle ] = useState("")   
    const [ content, setContent ] = useState("")

    // Preview
    const [ previewOpen, setPreviewOpen ] = useState(false)
    const [ showPopupAlert, setShowPopupAlert ] = useState(false)
    const previewWindowRef = useRef(null)

    // Prop to TipTap component to clear content after submitting form
    const [ submit, setSubmit ] = useState(false)

    const [ blogExists, setBlogExists ] = useState(null)
    const [ author, setAuthor] = useState(null)

    const { setLoading } = useLoadingContext()
    const { user } = useAuthContext()

    // Alert popup
    const { setAlertState } = useAlertContext()

    // Extend textarea
    const [ extendTextarea, setExtendTextarea ] = useState(false)

    // Style: Making label bolder when focusing on input/textarea 
    let initialLabels = { titleLabel: false, contentLabel: false }
    const [ labels, setLabels ] = useState(initialLabels)   
    const focusLabelFunc =(label) => {
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

    useEffect(() => {
        let isMounted = true;

        setLoading(true)
        setBlogExists(null)
        setTitle("")
        setContent("")
        setAuthor(null)

        axios.get(`${process.env.REACT_APP_API}/blog/${slug}`, { withCredentials: true })
        .then(response => {
            if (isMounted) {
                const { title: titleData, content: contentData, author: authorId } = response.data
                setTitle(titleData)
                setContent(contentData)
                setBlogExists(true)
                setAuthor(authorId?.username)
            }
        })
        .catch(error => {
            if (isMounted) {
                if (error.response && error.response.status === 404) {
                    setBlogExists(false) // Blog not found
                } else {
                    console.error("Error fetching a blog")
                }
            }
        })
        .finally(() => {
            if (isMounted) {
                setLoading(false)
            }
        })

        return () => { isMounted = false}
        // eslint-disable-next-line 
    }, [slug])

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
                    localStorage.setItem("previewData", JSON.stringify({ title, content }))
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

    // Edit Form
    const showEditForm = () => {
        return (
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
                            {content && <TipTap content={content} setContent={setContent} submit={submit} setSubmit={setSubmit} contentLabel={labels.contentLabel} />} {/* Render TipTap after content update to avoid passing initail content value during the initial render */}
                            <div className="sizing" onClick={()=>setExtendTextarea(!extendTextarea)}>
                                { !extendTextarea ? <TfiArrowsCorner/> : <BsArrowsAngleContract style={{transform:"scaleX(-1)"}}/>}
                            </div>
                        </div>
                    </div>
                </div>
                <footer className="button-group">
                    <button className="btn discard" type="button" onClick={()=>{window.history.back()}}>
                        <span className="icon">
                            <FaBan style={{transform:"scaleX(-1)"}} />
                        </span>
                        <label>Discard</label>
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
                    <button className="btn update" type="submit">
                        <span className="icon">
                            <FaUpRightFromSquare />
                        </span>
                        <label>Update</label>
                    </button>
                </footer>
            </form>
        )
    }

    // Submit form data
    const submitForm = (e) => {
        e.preventDefault()
        setLoading(true)
        axios.put(`${process.env.REACT_APP_API}/blog/${slug}`,{ title, content }, { withCredentials: true })
        .then(response => {
            setAlertState({ display: true, type: "success", message: response.data.message })
            window.history.back() // Go back to BlogPage
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

    if (blogExists === null || author === null) return <LoadingScreen />
    if (blogExists === false) return <NotFound />
    if (user?.username !== author) return <Navigate to={`/blog/${slug}`} /> // Add check for author === null above to handle the case request hasn't finished yet, preventing premature redirection

    return(
        <div className="EditBlog" onClick={outOfFocus}>
            <h2>Edit Your Blog</h2>
            {showEditForm()}

            {/* If preview couldn't open */}
            {showPopupAlert && 
                <PopupAlert
                    popupContent={`Please allow pop-ups for this site in your browser settings to use the preview feature.`}
                    showPopupAlert={showPopupAlert}
                    setShowPopupAlert={setShowPopupAlert}
                />
            } 
        </div>
    )
}

export default EditBlog

// © 2025 Pitipat Pattamawilai. All Rights Reserved.