import "./Form.css"
import { useEffect, useState } from "react"
import { FaPen } from "react-icons/fa";
import axios from "axios"
import { TfiArrowsCorner } from "react-icons/tfi";
import { BsArrowsAngleContract } from "react-icons/bs";
import { useAlertContext } from "../services/AlertContext";
import TipTap from "./TipTap";
import { useLoadingContext } from "../services/LoadingContext"
import { useAuthContext } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";

const Form = ()=>{

    const [ title, setTitle ] = useState("")

    const [ content, setContent ] = useState(() => {
        const data = localStorage.getItem("save_draft")
        return data ? JSON.parse(data).content : ""
    })
    // prop to TipTap component to clear content after submitting form
    const [ submit, setSubmit ] = useState(false)
        
    const { setLoading } = useLoadingContext()
    const { user } = useAuthContext()
    const navigate = useNavigate()

    // Save Draft
    const savingDraftFunc = (title,content) => {
        const data = { title, content }
        localStorage.setItem("save_draft",JSON.stringify(data))
        setAlertState({ display: true, type: "success", message: "Draft saved successfully." })
    }

    useEffect(() => {
        // in case saving draft
        if (localStorage.getItem("save_draft")) { // { title: "your title", content: "your content" }
            const saveDraft = JSON.parse(localStorage.getItem("save_draft"))
            setTitle(saveDraft.title)
            setContent(saveDraft.content)
        }
        // eslint-disable-next-line
    }, [])
    
// _____________________  Styles  _____________________

    // focusing on input/textarea making their label bolder
    let initialLabels = { titleLabel: false, contentLabel: false }
    const [ labels, setLabels ] = useState(initialLabels)   
    const focusLabelFunc = (label) => {
        initialLabels = { ...initialLabels, [label]: true }
        setLabels(initialLabels) // พอ state labels มีการ assign ค่าลงไป component นี้มันจะ re-render ส่งผลให้ ตัวแปร initialLabels กลับไปเป็นค่าเริ่มต้นตอนที่นิยาม
    }
    // click anywhere to stop focusing on text field
    const outOfFocus = (e) => {
        // if(e.target.nodeName !== "INPUT" && e.target.nodeName !== "TEXTAREA"){
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
    }, [extendTextarea])


// _______________________________________________________________

    // submitting form data
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
            navigate(`/profile/${user}`)
        })
        .catch(error => {
            console.error(error)
            setAlertState({ display: true, type: "error", message: error.response.data.message })
        })
        .finally(() => {
            setLoading(false)
        })
    }

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
                                { !extendTextarea ? <TfiArrowsCorner/> : <BsArrowsAngleContract style={{transform:"scaleX(-1)"}}/>} {/* icon มันไม่มีให้เลือกเยอะ ได้อันที่กลับด้านมา เลยกำหนด style */}
                            </div>
                        </div>
                    </div>
                </div>
                <footer className="button-group">
                    <button type="button" className="btn savedraft" onClick={()=>savingDraftFunc(title,content)}>Save Draft</button>
                    <input type="submit" value="Post" className="btn"/>
                </footer>    
            </form>
        </div>
    )
}

export default Form

// © 2025 Pitipat Pattamawilai. All Rights Reserved.