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
    const isSmallScreen = useMediaQuery("(max-width: 768px)")

    // Perform scrolling after extending textarea
    useEffect(() => {
        if (!extendTextarea) return

        const contentElement = document.getElementById("content-editor")
        const editorElement = document.getElementById("tiptap")

        if (!contentElement || !editorElement) return

        let timeout
        const handleTransitionEnd = () => {    
            const targetScrollY = getTotalOffsetTop(contentElement) - (isSmallScreen ? 0 : 80) - (isSmallScreen ? 20 : 16) // - fixed navbar height - spacing
            window.scrollTo({
                top: targetScrollY,
                behavior: "smooth"
            })

            clearTimeout(timeout)
            timeout = setTimeout(() => {
                editorElement.focus() // Auto-focus text editor after extending
            }, 150)

            // Ensure scrolling runs once per toggle; prevent future accidental scrolls when TipTap updates DOM
            editorElement.removeEventListener("transitionend", handleTransitionEnd)
        }

        // Textarea (text editor) has height-transition duration of 150ms
        editorElement.addEventListener("transitionend", handleTransitionEnd)

        return () => {
            clearTimeout(timeout)
            editorElement.removeEventListener("transitionend", handleTransitionEnd)
        }
    }, [extendTextarea, isSmallScreen])

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