import { useState, useEffect } from "react"
import "./EditComponent.css"
import { Navigate, useParams } from "react-router-dom"
import axios from "axios"
import { useAlertContext } from "../utils/AlertContext"
import { FaPen } from "react-icons/fa";
import { TfiArrowsCorner } from "react-icons/tfi";
import { BsArrowsAngleContract } from "react-icons/bs";
import TipTap from "./TipTap"
import { useLoadingContext } from "../utils/LoadingContext" 
import LoadingScreen from "./LoadingScreen"
import NotFound from "./NotFound"
import { useAuthContext } from "../utils/AuthContext"

const EditComponent = () => {
    const { slug } = useParams()

    const [ title, setTitle ] = useState("")   
    const [ content, setContent ] = useState("")

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
    
    // Distance from the top of the page
    function getTotalOffsetTop(element) {
        let offset = 0;
        while (element) {
          offset += element.offsetTop;
          element = element.offsetParent; // Move to the nearest positioned ancestor
        }
        return offset;
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

        axios.get(`${process.env.REACT_APP_API}/blog/${slug}`)
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

    // Edit Form
    const showEditForm = () => (
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
                <button type="button" className="btn discard" onClick={()=>{window.history.back()}}>Discard</button>
                <button type="submit" className="btn update">Update</button>
            </footer>
        </form>
    )

    // Submit form data
    const submitForm = (e) => {
        e.preventDefault()
        setLoading(true)
        axios.put(`${process.env.REACT_APP_API}/blog/${slug}`,{ title, content }, { withCredentials: true })
        .then(response => {
            setAlertState({ display: true, type: "success", message: response.data.message })
            window.history.back() // Go back to BlogComponent
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
        <div className="EditComponent" onClick={outOfFocus}>
            <h2>Edit Your Blog</h2>
            {showEditForm()}
        </div>
    )
}

export default EditComponent

// © 2025 Pitipat Pattamawilai. All Rights Reserved.