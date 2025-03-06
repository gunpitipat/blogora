import { useState, useEffect } from "react"
import "./EditComponent.css"
import { Navigate, useParams } from "react-router-dom"
import axios from "axios"
import { useAlertContext } from "../services/AlertContext"
import { FaPen } from "react-icons/fa";
import { TfiArrowsCorner } from "react-icons/tfi";
import { BsArrowsAngleContract } from "react-icons/bs";
import TipTap from "./TipTap"
import { useLoadingContext } from "../services/LoadingContext" 
import LoadingScreen from "./LoadingScreen"
import NotFound from "./NotFound"
import { useAuthContext } from "../services/AuthContext"

const EditComponent = () => {
    const { slug } = useParams()

    const [ title, setTitle ] = useState("")   
    const [ content, setContent ] = useState("")
    // prop to TipTap component to clear content after submitting form
    const [ submit, setSubmit ] = useState(false)

    const [ blogExists, setBlogExists ] = useState(null)
    const [ author, setAuthor] = useState(null) // if user !== author, user cannot modify other's blog by accessing directly to url path

    const { setLoading } = useLoadingContext()

    const { user } = useAuthContext()

    
// _____________________  Styles  _____________________

    // focusing on input/textarea making their label bolder
    let initialLabels = { titleLabel: false, contentLabel: false }
    const [ labels, setLabels ] = useState(initialLabels)   
    const focusLabelFunc =(label) => {
        initialLabels = { ...initialLabels, [label]: true }
        setLabels(initialLabels) // พอ state labels มีการ assign ค่าลงไป component นี้มันจะ re-render ส่งผลให้ ตัวแปร initialLabels กลับไปเป็นค่าเริ่มต้นตอนที่นิยาม
    }
    // click anywhere to stop focusing on text field
    const outOfFocus = (e) => {
        if (e.target.nodeName !== "INPUT") {
            setLabels(initialLabels)
        }
    }

    // alert popup
    const { setAlertState } = useAlertContext()

    // extend textarea
    const [ extendTextarea, setExtendTextarea ] = useState(false)
    
    // distance from the top of webpage
    function getTotalOffsetTop(element) {
        let offset = 0;
        while (element) {
          offset += element.offsetTop;
          element = element.offsetParent; // Move to the nearest positioned ancestor
        }
        return offset;
      }

    // Perform scrolling after extendTextarea set to true (the DOM updates). Textarea has transition duration 150ms to extend its height.
    useEffect(() => {
        if (extendTextarea) {
            const contentElement = document.getElementById("content")
            const editorElement = document.getElementById("text-editor")
                
            if (contentElement && editorElement) { // ensure contentElement not null and valid for calling other function to prevent Reference Error
                const handleTransitionEnd = ()=> {    
                    const targetScrollY = getTotalOffsetTop(contentElement) - 80 - 16 // 80 px of fixed navbar height and 16 px of 1 rem space
                    window.scrollTo({
                        top: targetScrollY,
                        behavior: "smooth"
                    })
                }

                // attach transitionend event listener to text editor
                editorElement.addEventListener("transitionend",handleTransitionEnd)

                // Cleanup: Remove the listener to prevent multiple stack up attaching event listener
                return () => {
                    editorElement.removeEventListener("transitionend", handleTransitionEnd);
                };
            }
        }
    },[extendTextarea])

// _______________________________________________________________

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
                const { title: titleData, content: contentData, author: authorData } = response.data
                setTitle(titleData)
                setContent(contentData)
                setBlogExists(true)
                setAuthor(authorData)
            }
        })
        .catch(error => {
            if (isMounted) {
                if (error.response?.status === 404) {
                    setBlogExists(false) // Blog not found
                } else {
                    console.error(error)
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
                        {content && <TipTap content={content} setContent={setContent} submit={submit} setSubmit={setSubmit} contentLabel={labels.contentLabel} />} {/* ตอน render EditComponent ค่าเริ่มต้น state content มันเป็นค่าว่าง มัน prop ไปให้ TipTap แล้ว content ของ TipTap ก็เป็นค่าว่าง ดังนั้นรอให้ state content มีค่าก่อน ค่อยให้ render TipTap */}
                        <div className="sizing" onClick={()=>setExtendTextarea(!extendTextarea)}>
                            { !extendTextarea ? <TfiArrowsCorner/> : <BsArrowsAngleContract style={{transform:"scaleX(-1)"}}/>} {/* icon มันไม่มีให้เลือกเยอะ ได้อันที่กลับด้านมา เลยกำหนด style */}
                        </div>
                    </div>
                </div>
            </div>
            <input type="submit" value="Update" className="btn"/>
        </form>
    )

    // submitting form data
    const submitForm = (e) => {
        e.preventDefault()
        setLoading(true)
        axios.put(`${process.env.REACT_APP_API}/blog/${slug}`,{ title, content }, { withCredentials: true })
        .then(response => {
            setAlertState({ display: true, type: "success", message: response.data.message })
            window.history.back() // go back to BlogComponent
        })
        .catch(error => {
            console.error(error)
            setAlertState({ display: true, type: "error", message: error.response.data.message })
        })
        .finally(() => {
            setLoading(false)
        })
    }

    if (blogExists === null || author === null) return <LoadingScreen />
    if (blogExists === false) return <NotFound />
    if (user !== author) return <Navigate to={`/blog/${slug}`} /> // prevent other users from modifying someone else's blog by directly accessing url path (at initially rendering, user might !== author because request hasn't finished yet so we add condition of author === null and return it above)

    return(
        <div className="EditComponent" onClick={outOfFocus}>
            <h2>Edit Your Blog</h2>
            {showEditForm()}
        </div>
    )
}

export default EditComponent

// © 2025 Pitipat Pattamawilai. All Rights Reserved.