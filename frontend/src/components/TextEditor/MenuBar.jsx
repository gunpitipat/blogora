import { memo, useState, useEffect } from "react"
import { useCurrentEditor } from "@tiptap/react"
import { IoText } from "react-icons/io5"
import { FaBold, FaItalic, FaLink, FaCheck, FaHeading, FaListUl, FaListOl, FaUndoAlt, FaRedoAlt, FaUnderline } from "react-icons/fa"
import { FaXmark } from "react-icons/fa6"

const MenuBar = memo(({
    submit,
    setSubmit,
    isLabelActive,
    showLinkInput,
    setShowLinkInput = () => {}
}) => {
    const { editor } = useCurrentEditor()
    const [linkText, setLinkText] = useState("")
    const [linkUrl, setLinkUrl] = useState("")
    const internalPaths = ["/explore", "/blog/", "/profile/", "/login", "/signup", "/create"]

    // Clear content after submitting form
    useEffect(() => {
        if (!editor) return
        if (submit) {
            setTimeout(() => editor.commands.clearContent(), 0)
            setSubmit(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submit, editor])

    if (!editor || !editor.view?.dom) return null

    const isActive = (type) => {
        if (!isLabelActive) return false
        return editor.isActive(type)
    }

    const resetLinkInput = () => {
        setShowLinkInput(false)
        setLinkText("")
        setLinkUrl("")
    }

    const toggleLink = () => {
        const { from, to } = editor.state.selection
        const hasSelection = from !== to

        if (showLinkInput) {
            resetLinkInput()
            return
        }

        if (editor.isActive("link")) {
            editor.commands.unsetLink()
            return
        }

        if (hasSelection) {
            const selectedText = editor.state.doc.textBetween(from, to).trim()
            const isLikelyUrl = 
                selectedText.startsWith("http://") || 
                selectedText.startsWith("https://") || 
                internalPaths.some(path => selectedText.startsWith(path))

            isLikelyUrl ? setLinkUrl(selectedText) : setLinkText(selectedText)
        }
        setShowLinkInput(true)
    }

    const insertLink = () => {
        const trimmedLinkUrl = linkUrl.trim()
        const trimmedLinkText = linkText.trim()

        if (!trimmedLinkUrl) return

        const isExternal = /^https?:\/\//.test(trimmedLinkUrl) &&
                           !trimmedLinkUrl.includes(window.location.hostname)
        const linkAttrs = isExternal 
            ? { href: trimmedLinkUrl, target: "_blank", rel: "noopener noreferrer" }
            : { href: trimmedLinkUrl, target: "_self" }

        editor
            .chain()
            .focus()
            .insertContent([{ 
                type: "text", 
                text: trimmedLinkText ? trimmedLinkText : trimmedLinkUrl, 
                marks: [{ type: "link", attrs: linkAttrs }]
            }])
            .unsetMark("link")
            .run()

        resetLinkInput()
    }

    return (
        <div className="menu-bar">
            <div className="button-group">
                {/* Paragraph */}
                <button 
                    type="button"
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={isActive("paragraph") ? "active" : ""}
                >
                    <IoText style={{ transform: "scale(1.2)"}} />
                </button>

                {/* Heading */}
                <button 
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={(isLabelActive && editor.isActive("heading", { level: 1 })) ? "active" : ""}
                >
                    <FaHeading/>
                </button>

                {/* Bold */}
                <button 
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={isActive("bold") ? "active" : ""}
                >
                    <FaBold/>
                </button>

                {/* Italic */}
                <button 
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={isActive("italic") ? "active" : ""}
                >
                    <FaItalic/>
                </button>

                {/* Underline */}
                <button 
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={isActive("underline") ? "active" : ""}
                >
                    <FaUnderline/>
                </button>

                {/* Link */}
                <div className="link-container">
                    <button 
                        type="button"
                        onClick={toggleLink}
                        className={isActive("link") || showLinkInput ? "active" : ""}
                    >
                        <FaLink />
                    </button>
                    {/* Link Input */}
                    <div className={`link-input-panel ${showLinkInput ? "show" : ""}`}>
                        <div className="link-input-field">
                            <label>Display text <span>{'('}optional{')'}</span></label>
                            <input 
                                type="text"
                                value={linkText}
                                onChange={(e) => setLinkText(e.target.value)}
                            />
                        </div>
                        <div className="link-input-field">
                            <label>URL</label>
                            <input 
                                className="link-url-field"
                                type="text"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                            />
                        </div>
                        <div className="link-input-actions">
                            <span onClick={resetLinkInput}>
                                <FaXmark style={{ fontSize: "1.4rem" }} />
                            </span>
                            <span onClick={insertLink}>
                                <FaCheck />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Unordered List */}
                <button 
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={isActive("bulletList") ? "active" : ""}
                >
                    <FaListUl/>
                </button>

                {/* Ordered List */}
                <button 
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={isActive("orderedList") ? "active" : ""}
                >
                    <FaListOl/>
                </button>
            </div>

            <div className="button-group">
                {/* Undo */}
                <button 
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                >
                    <FaUndoAlt/>
                </button>

                {/* Redo */}
                <button 
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                >
                    <FaRedoAlt/>
                </button>
            </div>
        </div>
    )
})

export default MenuBar

// © 2025 Pitipat Pattamawilai. All Rights Reserved.