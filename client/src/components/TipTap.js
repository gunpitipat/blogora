import "./TipTap.css"
import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, {useEffect} from 'react'
import Underline from "@tiptap/extension-underline"
import { IoText } from "react-icons/io5";
import Heading from "@tiptap/extension-heading";


//icons
import { FaBold, FaItalic, FaStrikethrough, FaHeading, FaListUl, FaListOl, FaUndoAlt, FaRedoAlt, FaUnderline } from "react-icons/fa";

export const MenuBar = (props) => {
  const { editor } = useCurrentEditor()

  const {submit, contentLabel } = props // from Form.js
  // contentLabel is state from Form.js or EditComponent.js for focus label of selected input field
  // this component uses contentLabel for styling button of paragraph by set its className to is-active

  if (!editor) {
    return null
  }

  return (
    <div className="MenuBar">
      <div className="button-group">
      <button type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          // className={editor.isActive('paragraph') ? 'paragraph is-active' : 'paragraph'}
          className={ (contentLabel && editor.isActive('paragraph')) ? "paragraph is-active" : "paragraph" }
        >
          <IoText />
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
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
          className={editor.isActive('bold') ? 'is-active' : ''}
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
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          <FaItalic/>
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
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
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          <FaStrikethrough/>
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          <FaListUl/>
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
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
      allowedTags: [ 'p', 'h1', 'strong', 'i', 'ul', 'ol', 'a', 'br' ], // Only tags for menubar features
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
  // Link.configure({
  //   defaultProtocol: 'https',
  //   protocols: ['http', 'https'],
  //   openOnClick: true, // Enable opening links by clicking
  //   HTMLAttributes: {
  //     class: 'custom-link', // Add a custom class to links
  //   },
  // }),
]


const TipTap = (props) => {
  const { content, setContent, submit, setSubmit, contentLabel } = props

  const onUpdate = ({editor}) => {
    const myHtml = editor.getHTML().replace(/<p>\s*<\/p>/g, "<p><br></p>");
    setContent(myHtml)
  }  

  useEffect(() => {
    setSubmit(false)
    // eslint-disable-next-line
  },[submit])

  return (
    <div className="text-editor">
      <EditorProvider slotBefore={<MenuBar submit={submit} setSubmit={setSubmit} contentLabel={contentLabel}/>}
       extensions={extensions} 
       content={content} 
       onUpdate={onUpdate}
       editorProps={{
        attributes: {
          id: "text-editor",
        }
       }}
       
      ></EditorProvider> 
    </div>
  )
}

export default TipTap