import "./TipTap.css"
import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useEffect} from 'react'
import Underline from "@tiptap/extension-underline"
import { IoText } from "react-icons/io5";
import Heading from "@tiptap/extension-heading";
import { FaBold, FaItalic, FaStrikethrough, FaHeading, FaListUl, FaListOl, FaUndoAlt, FaRedoAlt, FaUnderline } from "react-icons/fa";

export const MenuBar = (props) => {
  const { editor } = useCurrentEditor()

  const { submit, isFocusing } = props

  if (!editor) {
    return null
  }

  const isActive = (type) => {
    if (!isFocusing) return false
    return editor.isActive(type)
  }

  return (
    <div className="MenuBar">
      <div className="button-group">
        {/* Paragraph button */}
        <button type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={ isActive("paragraph") ? "paragraph is-active" : "paragraph" }
        >
          <IoText />
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={ (isFocusing && editor.isActive('heading', { level: 1 })) ? 'is-active' : ''}
        >
          <FaHeading/>
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          className={isActive("bold") ? 'is-active' : ''}
        >
          <FaBold/>
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          className={isActive("italic") ? 'is-active' : ''}
        >
          <FaItalic/>
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={isActive("underline") ? 'is-active' : ''}
        >
          <FaUnderline/>
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleStrike()
              .run()
          }
          className={isActive("strike") ? 'is-active' : ''}
        >
          <FaStrikethrough/>
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={isActive("bulletList") ? 'is-active' : ''}
        >
          <FaListUl/>
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={isActive("orderedList") ? 'is-active' : ''}
        >
          <FaListOl/>
        </button>
      </div>
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

        {/* To clear content after submitting form in Form.js */}
        {submit ? setTimeout(()=>{
          editor.commands.clearContent()
        },0) : null }

      </div>
    </div>
  )
}

const extensions = [
  StarterKit.configure({
    heading: false,
    bulletList: { 
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    blockquote: false,
    codeBlock: false,
  },{
    HTMLAttributes: {
      allowedTags: [ 'p', 'h1', 'strong', 'i', 'ul', 'ol', 'li' ], // Only tags for menubar features
    },
  }),
  Underline.configure({
    HTMLAttributes: {
      class: 'my-custom-class',
    },
    }),
  Heading.configure({
    levels: [1], // Allow only h1, disable h2-h6
  }),
]

const TipTap = (props) => {
  const { content, setContent, submit, setSubmit, isFocusing, onFocus, onBlur } = props

  const onUpdate = ({ editor }) => {
    let htmlContent = editor.getHTML()

    // Preserve intentional spaces within text
    htmlContent = htmlContent.replace(/ {2,}/g, match => {
      return '&nbsp;'.repeat(match.length - 1) + ' ' // Add one real space at the end to prevent long unbreakable lines
    })
    // Preseve a single leading space after opening tag, preventing editor from trimming whitespace
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
      /<li>\s*(<p>[\s\S]*<\/p>)\s*<p>[\s\S]*<\/li>/gi, // Capture something like <li><p></p><p><br>Text</p></li>
      '<li>$1</li>'
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
            isFocusing={isFocusing}
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
}

export default TipTap

// © 2025 Pitipat Pattamawilai. All Rights Reserved.