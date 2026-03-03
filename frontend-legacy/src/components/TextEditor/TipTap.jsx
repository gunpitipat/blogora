import "./TipTap.css"
import { memo, useState } from "react"
import { EditorProvider } from "@tiptap/react"
import extensions from "./tiptapExtensions"
import MenuBar from "./MenuBar"

const TipTap = memo(({
    content,
    setContent,
    submit,
    setSubmit,
    isLabelActive,
    onFocus,
    onBlur
}) => {
    const [ready, setReady] = useState(false)
    const [showLinkInput, setShowLinkInput] = useState(false)

    const onCreate = ({ editor }) => {
        if (editor && editor.view && editor.view.dom) setReady(true)
    }

    const onUpdate = ({ editor }) => {
        let htmlContent = editor.getHTML()

        // Preserve intentional spaces within text
        htmlContent = htmlContent.replace(/ {2,}/g, match => {
            return "&nbsp;".repeat(match.length - 1) + " " // Add one real space at the end to prevent long unbreakable lines
        })

        // Preserve a single leading space after opening tag, preventing editor from trimming whitespace
        htmlContent = htmlContent.replace(/(<[^>]+>) /g, "$1&nbsp;")

        // Disallow leading <br> inside list items (Shift+Enter on an empty list item)
        let cleanedContent = htmlContent.replace(
            /(<li>\s*<p>)(?:<(strong|em|u|s|a)[^>]*>)*(?:&nbsp;|\s|<\/?(strong|em|u|s|a)[^>]*>)*(<br\s*\/?>\s*)+/gi, // Capture something like <li><p><br>, <li><p><u class="tiptap-underline">&nbsp; </u><br>
            "$1"
        )

        // Disallow empty list items (Enter on an empty list item)
        cleanedContent = cleanedContent.replace(
            /<li>\s*<p>(?:<[^>]+>)*(\s|&nbsp;)*(?:<\/?[^>]+>)*<\/p>\s*<\/li>\s*(?=<li>)/gi, // Capture something like <li><p>&nbsp; </p></li><li> (excluding lookahead <li>)
            "" // Replacing entire <li> with "" still results in <li><p></p></li> due to default editor behavior
        )

        // Disallow leading empty <p> inside list items (edge case) caused by inserting list between content and pressing Shift+Enter twice
        cleanedContent = cleanedContent.replace(
            /<li>\s*<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>\s*(<p>[\s\S]*?<\/p>)\s*<\/li>/gi,
            "<li>$2</li>"
        )

        // Sync editor content displayed only if cleaned up
        if (cleanedContent !== htmlContent) {
            const { from } = editor.state.selection
            editor.commands.setContent(cleanedContent, false) // false -> do not add to undo history
            editor.chain().setTextSelection(from).run() // Restore cursor position (selection)
        }

        setContent(cleanedContent)
    }

    return (
        <div className="tiptap-wrapper">
            { showLinkInput && <div className="link-input-overlay" /> }
            <EditorProvider
                extensions={extensions}
                content={content}
                onCreate={onCreate}
                onUpdate={onUpdate}
                editorProps={{
                    attributes: {
                        id: "tiptap",
                        class: `tiptap ${showLinkInput ? "disabled" : ""}`
                    },
                    handleDOMEvents: {
                        focus: () => { onFocus?.(); return false },
                        blur:  () => { onBlur?.();  return false }
                    }
                }}
                slotBefore={
                    <MenuBar 
                        submit={submit}
                        setSubmit={setSubmit}
                        isLabelActive={isLabelActive}
                        showLinkInput={showLinkInput}
                        setShowLinkInput={setShowLinkInput}
                    />
                }
            >
                {/* Extra skeleton in case MenuBar renders before editor (especially on mobile) */}
                { !ready && 
                    <div className="tiptap-skeleton-overlay">
                        <div className="tiptap-skeleton" /> 
                    </div>
                }
            </EditorProvider>
        </div>
    )
})

export default TipTap

// © 2025 Pitipat Pattamawilai. All Rights Reserved.