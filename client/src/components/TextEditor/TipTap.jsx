import "./TipTap.css"
import { memo, useEffect } from 'react'
import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from "@tiptap/extension-underline"
import Heading from "@tiptap/extension-heading";
import { IoText } from "react-icons/io5";
import { FaBold, FaItalic, FaStrikethrough, FaHeading, FaListUl, FaListOl, FaUndoAlt, FaRedoAlt, FaUnderline } from "react-icons/fa";

export const MenuBar = memo(({
  submit, 
  isLabelActive
}) => {
  const { editor } = useCurrentEditor()
  
  if (!editor) return null

  const isActive = (type) => {
    if (!isLabelActive) return false
    return editor.isActive(type)
  }

  return (
    <div className="menu-bar">
      <div className="button-group">
        {/* Paragraph */}
        <button type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`paragraph-btn ${isActive("paragraph") ? "active" : ""}`}
        >
          <IoText />
        </button>

        {/* Heading */}
        <button type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={(isLabelActive && editor.isActive("heading", { level: 1 })) ? "active" : ""}
        >
          <FaHeading/>
        </button>

        {/* Bold */}
        <button type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          className={isActive("bold") ? "active" : ""}
        >
          <FaBold/>
        </button>

        {/* Italic */}
        <button type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          className={isActive("italic") ? "active" : ""}
        >
          <FaItalic/>
        </button>

        {/* Underline */}
        <button type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={isActive("underline") ? "active" : ""}
        >
          <FaUnderline/>
        </button>

        {/* Strike */}
        <button type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleStrike()
              .run()
          }
          className={isActive("strike") ? "active" : ""}
        >
          <FaStrikethrough/>
        </button>

        {/* Unordered List */}
        <button type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={isActive("bulletList") ? "active" : ""}
        >
          <FaListUl/>
        </button>

        {/* Ordered List */}
        <button type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={isActive("orderedList") ? "active" : ""}
        >
          <FaListOl/>
        </button>
      </div>

      {/* Undo */}
      <div className="button-group">
        <button type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .undo()
              .run()
          }
        >
          <FaUndoAlt/>
        </button>

        {/* Redo */}
        <button type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .redo()
              .run()
          }
        >
          <FaRedoAlt/>
        </button>

        {/* To clear content after submitting form in CreateBlog.jsx */}
        { submit 
        ? setTimeout(() => {
            editor.commands.clearContent()
          },0) 
        : null 
        }
      </div>
    </div>
  )
})

const extensions = [
  StarterKit.configure({
    heading: false,
    bulletList: { 
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` because marks are not preserved when trying to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` because marks are not preserved when trying to preserve attrs, awaiting a bit of help
    },
    blockquote: false,
    codeBlock: false,
  }, {
    HTMLAttributes: {
      allowedTags: [ "p", "h1", "strong", "i", "ul", "ol", "li" ], // Only tags for menubar features
    },
  }),
  Underline.configure({
    HTMLAttributes: {
      class: "my-custom-class",
    },
  }),
  Heading.configure({
    levels: [1], // Allow only h1, disable h2-h6
  }),
]

const TipTap = memo(({
  content, 
  setContent, 
  submit, 
  setSubmit, 
  isLabelActive, 
  onFocus, 
  onBlur
}) => {
  const onUpdate = ({ editor }) => {
    let htmlContent = editor.getHTML()

    // Preserve intentional spaces within text
    htmlContent = htmlContent.replace(/ {2,}/g, match => {
      return '&nbsp;'.repeat(match.length - 1) + ' ' // Add one real space at the end to prevent long unbreakable lines
    })
    // Preserve a single leading space after opening tag, preventing editor from trimming whitespace
    htmlContent = htmlContent.replace(/(<[^>]+>) /g, '$1&nbsp;')

    // Disallow leading <br> inside list items (Shift+Enter on an empty list item)
    let cleanedContent = htmlContent.replace(
      /(<li>\s*<p>)(?:<(strong|em|u|s)[^>]*>)*(?:&nbsp;|\s|<\/?(strong|em|u|s)[^>]*>)*(<br\s*\/?>\s*)+/gi, // Capture something like <li><p><br>, <li><p><u class=\"my-custom-class\">&nbsp; </u><br>
      '$1'
    )

    // Disallow empty list items (Enter on an empty list item)
    cleanedContent = cleanedContent.replace(
      /<li>\s*<p>(?:<[^>]+>)*(\s|&nbsp;)*(?:<\/?[^>]+>)*<\/p>\s*<\/li>\s*(?=<li>)/gi, // Capture something like <li><p>&nbsp; </p></li><li> (excluding lookahead <li>)
      '' // Replacing entire <li> with '' still results in <li><p></p></li> due to default editor behavior
    )

    // Disallow leading empty <p> inside list items (edge case) caused by inserting list between content and pressing Shift+Enter twice
    cleanedContent = cleanedContent.replace(
      /<li>\s*<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>\s*(<p>[\s\S]*?<\/p>)\s*<\/li>/gi,
      '<li>$2</li>'
    )

    // Sync editor content displayed only if cleaned up
    if (cleanedContent !== htmlContent) {
      const { from } = editor.state.selection

      editor.commands.setContent(cleanedContent, false) // false -> do not add to undo history

      editor.chain().setTextSelection(from).run() // Restore cursor position (selection)
    }

    setContent(cleanedContent)
  }

  useEffect(() => {
    setSubmit(false)
    // eslint-disable-next-line
  }, [submit])

  return (
    <div className="text-editor">
      <EditorProvider 
        slotBefore={
          <MenuBar 
            submit={submit} 
            setSubmit={setSubmit} 
            isLabelActive={isLabelActive}
          />
        }
        extensions={extensions} 
        content={content} 
        onUpdate={onUpdate}
        editorProps={{
          attributes: {
            id: "text-editor",
          },
          handleDOMEvents: {
            focus: () => {
              onFocus?.()
              return false
            },
            blur: () => {
              onBlur?.()
              return false
            }
          }
        }}
      /> 
    </div>
  )
})

export default TipTap

// © 2025 Pitipat Pattamawilai. All Rights Reserved.