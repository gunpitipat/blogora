import "./BlogContent.css"
import parse, { domToReact } from "html-react-parser"
import { memo, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../contexts/AuthContext";
import { handleEmptyLine } from "../../../utils/contentUtils"
import Modal from "../../../components/Modals/Modal"
import Timestamp from "../../../components/Timestamp/Timestamp"
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { IoChevronBackOutline } from "react-icons/io5";

const BlogContent = memo(({
    title, 
    content, 
    author, 
    createdDate, 
    slug,
    onDelete
}) => {
    const [showOptions, setShowOptions] = useState(false)
    const [showModal, setShowModal] = useState(false)

    const { user } = useAuthContext()
    const navigate = useNavigate()
    const location = useLocation()

    const isAuthor = user?.username === author
    const isAdmin = user?.role === "admin"

    // Go-back button handler
    const handleGoBack = () => {
        if (location.key !== "default") {
            navigate(-1)
        } else {
            navigate("/explore")
        }
    }

    const handleDelete = () => {
        onDelete(slug, () => {
            setShowModal(false) // In case session expires, prevent 2 modal overlays from overlapping each other
            setShowOptions(false)
        })
    }

    // Close blog setting tab and modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!showOptions) return // Exit early if setting tab is not open

            if (showModal) {
                if (e.target.classList.contains("modal-overlay") || e.target.classList.contains("cancel-btn")) {
                    setShowOptions(false)
                    setShowModal(false)
                }
            } else {
                if (!e.target.closest(".blog-setting")) { // Ensure clicking `Edit` or `Delete` won't close the setting tab
                    setShowOptions(false)
                }
            }
        }

        document.addEventListener("click", handleClickOutside)
        return () => document.removeEventListener("click", handleClickOutside)
    }, [showOptions, showModal])

    const parsedContent = useMemo(() => {
        // Preserve intentional empty lines
        const formattedHtml = handleEmptyLine(content)
        // Replace internal <a> with <Link>, ensuring proper go-back behavior
        const options = {
            replace: (node) => {
                if (node.name === "a" && node.attribs?.href) {
                    const url = new URL(node.attribs.href, window.location.origin)

                    // Internal links
                    if (url.origin === window.location.origin) {
                        const to = url.pathname + url.search + url.hash
                        return (
                            <Link to={to}>
                                {domToReact(node.children, options)}
                            </Link>
                        )
                    }
                    // External links
                    return (
                        <a
                            href={node.attribs.href}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {domToReact(node.children, options)}
                        </a>
                    )
                }
            }
        }

        return parse(formattedHtml, options)
    }, [content])

    return (
        <section className="blog-content">
            <header>
                <h1 className={`title ${showOptions ? "fade" : ""}`}>
                    {title}
                </h1>

                <div className="goback-icon" onClick={handleGoBack}>
                    <IoChevronBackOutline />
                </div>
                
                { (isAuthor || isAdmin) &&
                    <>
                        <div className="blog-setting">
                            <span className="setting-icon" onClick={() => setShowOptions(!showOptions)}>
                                <BiDotsHorizontalRounded />
                            </span>
                            { showOptions && 
                                <ul className="options">
                                    <Link to={`/blog/edit/${slug}`} className="edit-option">
                                        <li>
                                            Edit
                                        </li>
                                    </Link>
                                    <li className="delete-option" onClick={() => setShowModal(true)}>
                                        Delete
                                    </li>    
                                </ul>
                            }
                        </div>
                        <Modal
                            showModal={showModal}
                            setShowModal={setShowModal}
                            action="Delete"
                            cancelLabel="Cancel"
                            title="Confirm Delete"
                            content={
                                <p>Are you sure you want to delete "<span>{title}</span>" blog?</p>
                            }
                            onConfirm={handleDelete}
                        />
                    </>
                }
            </header>

            <main className="tiptap-result">
                {parsedContent}
            </main>

            <footer>
                <Link to={`/profile/${author}`} className="author">
                    {author}
                </Link>
                <Timestamp date={createdDate} />
            </footer>    
        </section>
    )
})

export default BlogContent

// © 2025 Pitipat Pattamawilai. All Rights Reserved.