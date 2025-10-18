import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Heading from "@tiptap/extension-heading"
import Link from '@tiptap/extension-link'

const extensions = [
    StarterKit.configure({
        heading: false,
        bulletList: { 
            keepMarks: true,
            keepAttributes: false // TODO : Making this as `false` because marks are not preserved when trying to preserve attrs
        },
        orderedList: {
            keepMarks: true,
            keepAttributes: false
        },
        blockquote: false,
        codeBlock: false,
        code: false // Disable inline code formatting triggered by backticks
    }, {
        HTMLAttributes: {
            allowedTags: [ "p", "h1", "strong", "i", "a", "ul", "ol", "li" ] // Only tags for menubar features
        }
    }),
    Underline.configure({
        HTMLAttributes: {
            class: "tiptap-underline"
        }
    }),
    Heading.configure({
        levels: [1] // Allow only h1, disable h2-h6
    }),
    Link.configure({
        openOnClick: false,
        autolink: false,
        linkOnPaste: false, // NOTE: Paste still auto-links (likely due to TipTap/ProseMirror), but pasting a URL over selected text now correctly replaces it with an auto-linked URL.
        HTMLAttributes: {
            rel: null,
            target: null, // Let insertLink() in MenuBar decide
        }
    })
]

export default extensions

// © 2025 Pitipat Pattamawilai. All Rights Reserved.