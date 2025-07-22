import "./ContentEditor.css"
import { memo, useEffect, useState } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery"
import { getTotalOffsetTop } from "../../utils/layoutUtils";
import TipTap from "./TipTap";
import { FaPen } from "react-icons/fa";
import { TfiArrowsCorner } from "react-icons/tfi";
import { BsArrowsAngleContract } from "react-icons/bs";

// Used by CreateBlog.jsx and EditBlog.jsx
const ContentEditor = memo(({ 
    content,
    setContent, 
    submit,
    setSubmit,
    isLabelActive, 
    onFocus,
    onBlur
}) => {
    const [extendTextarea, setExtendTextarea] = useState(false)
    const isSmallDevice = useMediaQuery("(max-width: 768px)")

    // Perform scrolling after extendTextarea set to true
    useEffect(() => {
        if (extendTextarea) {
            const contentElement = document.getElementById("content-editor")
            const editorElement = document.getElementById("text-editor")
                
            if (contentElement && editorElement) {
                const handleTransitionEnd = () => {    
                    const targetScrollY = getTotalOffsetTop(contentElement) - (isSmallDevice ? 0 : 80) - (isSmallDevice ? 20 : 16) // - fixed navbar height - spacing
                    window.scrollTo({
                        top: targetScrollY,
                        behavior: "smooth"
                    })
                    setTimeout(() => {
                        editorElement.focus()
                    }, 150)
                }

                // Textarea (text editor) has height-transition duration of 150ms
                editorElement.addEventListener("transitionend", handleTransitionEnd)
                return () => editorElement.removeEventListener("transitionend", handleTransitionEnd);
            }
        }
    }, [extendTextarea, isSmallDevice])

    return (
        <div className="content-editor" id="content-editor">
            <label className={`form-label ${isLabelActive ? "active" : ""}`}>
                Content
                { isLabelActive && 
                    <span className="pen-icon">
                        <FaPen />
                    </span>
                }
            </label>
            <div className={`textarea-container ${extendTextarea ? "extended" : ""}`}>
                { content !== null && (
                    <TipTap 
                        content={content}
                        setContent={setContent}
                        submit={submit} 
                        setSubmit={setSubmit}
                        isLabelActive={isLabelActive}
                        onFocus={onFocus}
                        onBlur={onBlur}
                    />
                )}
                <div className="extend-toggle" onClick={() => setExtendTextarea(!extendTextarea)}>
                    { !extendTextarea 
                        ? <TfiArrowsCorner /> 
                        : <BsArrowsAngleContract style={{ transform: "scaleX(-1)" }} />
                    }
                </div>
            </div>
        </div>
    )
})

export default ContentEditor

// © 2025 Pitipat Pattamawilai. All Rights Reserved.