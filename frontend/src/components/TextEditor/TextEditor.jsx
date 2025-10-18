import "./TextEditor.css"
import { memo, useEffect, useState } from "react"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { getTotalOffsetTop } from "@/utils/layoutUtils"
import TipTap from "./TipTap"
import { FaPen } from "react-icons/fa"
import { TfiArrowsCorner } from "react-icons/tfi"
import { BsArrowsAngleContract } from "react-icons/bs"

const TextEditor = memo(({ 
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

        const editor = document.getElementById("text-editor")
        const tiptap = document.getElementById("tiptap")

        if (!editor || !tiptap) return

        let timeout
        const handleTransitionEnd = () => {    
            const targetScrollY = getTotalOffsetTop(editor) - (isSmallScreen ? 0 : 80) - (isSmallScreen ? 20 : 16) // - fixed navbar height - spacing
            window.scrollTo({
                top: targetScrollY,
                behavior: "smooth"
            })

            clearTimeout(timeout)
            timeout = setTimeout(() => {
                tiptap.focus() // Auto-focus text editor after extending
            }, 150)

            // Ensure scrolling runs once per toggle; prevent future accidental scrolls when TipTap updates DOM
            tiptap.removeEventListener("transitionend", handleTransitionEnd)
        }

        // .tiptap has height-transition duration of 150ms
        tiptap.addEventListener("transitionend", handleTransitionEnd)

        return () => {
            clearTimeout(timeout)
            tiptap.removeEventListener("transitionend", handleTransitionEnd)
        }
    }, [extendTextarea, isSmallScreen])

    return (
        <div className="text-editor" id="text-editor">
            <label className={`form-label ${isLabelActive ? "active" : ""}`}>
                Content
                { isLabelActive && 
                    <span className="pen-icon">
                        <FaPen />
                    </span>
                }
            </label>
            <div className={`textarea-container ${extendTextarea ? "extended" : ""}`}>
                { content === null
                    ?   <div className="tiptap-wrapper">
                            <div className="menu-bar-skeleton" />
                            <div className="tiptap-skeleton" />
                        </div>
                    :   <TipTap 
                            content={content}
                            setContent={setContent}
                            submit={submit} 
                            setSubmit={setSubmit}
                            isLabelActive={isLabelActive}
                            onFocus={onFocus}
                            onBlur={onBlur}
                        />
                }
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

export default TextEditor

// © 2025 Pitipat Pattamawilai. All Rights Reserved.