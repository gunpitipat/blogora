import "./BlogFormButtons.css"
import { memo } from "react"
import { FaEye } from "react-icons/fa"
import { FaBan, FaUpRightFromSquare, FaPenToSquare } from "react-icons/fa6"

// Used by CreateBlog.jsx and EditBlog.jsx
const BlogFormButtons = memo(({
    firstBtnLabel,
    onFirstClick,
    previewOpen,
    previewBlog,
    thirdBtnLabel
}) => {
    const normalizeClass = (label) => label.toLowerCase().replace(/\s+/g, '')

    const firstBtnClass = normalizeClass(firstBtnLabel)
    const thirdBtnClass = normalizeClass(thirdBtnLabel)

    return (
        <div className="blog-form-btns">
            <button className={`${firstBtnClass}-btn`}
                type="button" 
                onClick={onFirstClick}
            >
                <span className={`${firstBtnClass}-icon`}>
                    { firstBtnLabel === "Save Draft" && <FaPenToSquare /> }
                    { firstBtnLabel === "Discard" && <FaBan style={{ transform: "scaleX(-1)" }} /> }
                </span>
                <label>{firstBtnLabel}</label>
            </button>
                
            <button className={`preview-btn ${previewOpen ? "previewing" : ""}`} 
                type="button" 
                onClick={previewBlog}
            >
                { !previewOpen &&
                    <span className="preview-icon">
                        <FaUpRightFromSquare />
                        <FaEye className="eye-icon" />
                    </span>
                }
                <label>
                    {!previewOpen ? "Preview" : "Previewing"}
                </label>
            </button>

            <button className={`submit-btn ${thirdBtnClass}-btn`}
                type="submit"
            >
                <span className={`${thirdBtnClass}-icon`}>
                    <FaUpRightFromSquare />
                </span>
                <label>{thirdBtnLabel}</label>
            </button>
        </div>
    )
})

export default BlogFormButtons

// © 2025 Pitipat Pattamawilai. All Rights Reserved.