import "./Preview.css"
import parse from "html-react-parser"
import { useState, useEffect } from "react"
import { useLocation, useParams } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import { formatDayMonth } from "../../utils/formatDateUtils";
import { handleEmptyLine } from "../../utils/contentUtils";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import NotFound from "../NotFound/NotFound";
import PopupAlert from "../../components/Popups/PopupAlert";
import Footer from "../../components/Layout/Footer";
import { IoChevronBackOutline } from "react-icons/io5";
import { LuCirclePlus } from "react-icons/lu";

const Preview = () => {
    const { slug } = useParams()
    const [sessionValid, setSessionValid] = useState(null)
    const [previewData, setPreviewData] = useState({ title: "", content: "" })
    const [showPopupAlert, setShowPopupAlert] = useState(false)

    const location = useLocation()
    const { user } = useAuthContext()

    // Validate and set a flag when preview opens
    useEffect(() => {        
        sessionStorage.setItem("previewSync", slug) // To verify sync between CreateBlog/EditBlog and Preview

        // Check if preview is open and controllable by CreateBlog/EditBlog
        const validatePreview = () => {
            // If a user navigates away with only slug changed (e.g. from /preview/123 to /preview/456)
            if (sessionStorage.getItem("previousPath") && (sessionStorage.getItem("previousPath") !== sessionStorage.getItem("previewSync"))) {
                setSessionValid(false)
                localStorage.setItem("previewOpen", "false") // Notify CreateBlog/EditBlog
            } else if (localStorage.getItem("formSync") === sessionStorage.getItem("previewSync")) {
                localStorage.setItem("previewOpen", "true") // Set a flag if it's controllable
                setSessionValid(true)
            } else {
                setSessionValid(false)
            }
        }
        
        // Listen for formSync removing on CreateBlog/EditBlog unmount
        const handleStorageChange = (event) => {
            if (event.key === "formSync" && !event.newValue) {
                setSessionValid(false)
            }
        }

        validatePreview()
        window.addEventListener("storage", handleStorageChange)

        return () => window.removeEventListener("storage", handleStorageChange)
        // eslint-disable-next-line
    }, [])

    // Invalidate when navigated away
    useEffect(() => {
        const handleUnload = () => {
            sessionStorage.setItem("previousPath", location.pathname.split("/").pop())
        }
        
        window.addEventListener("unload", handleUnload)
        return () => window.removeEventListener("unload", handleUnload)
        // eslint-disable-next-line
    }, [])

    // Initialize previewData
    useEffect(() => {
        if (sessionValid) {
            setPreviewData(() => {
                // Read from localStorage on first render or sessionStorage on refreshes
                const data = localStorage.getItem("previewData") || sessionStorage.getItem("previewData")

                if (data) {
                    // Transfer data from localStorage to sessionStorage
                    sessionStorage.setItem("previewData", data)
                }
                
                return data ? JSON.parse(data) : { title: "", content: "" }
            })
        } else {
            setPreviewData(JSON.parse(sessionStorage.getItem("previewData")) || { title: "", content: "" })
        }
    }, [sessionValid])

    // Updates data in real-time
    useEffect(() => {
        if (!sessionValid) return

        const handleStorageChange = (event) => {
            if (event.key === "previewData" && event.newValue) {
                sessionStorage.setItem("previewData", event.newValue)
                setPreviewData(JSON.parse(event.newValue))
            }
        }

        window.addEventListener("storage", handleStorageChange)
        return () => window.removeEventListener("storage", handleStorageChange)
    }, [sessionValid])

    // Notify CreateBlog/EditBlog to clean up localStorage when preview tab is closed
    useEffect(() => {
        const handleUnload = () => {
            if (sessionValid) { // Skip if invalid to prevent stale preview tab from notifying while valid tab is in sync
                localStorage.setItem("previewOpen", "false")
            }
        }

        window.addEventListener("unload", handleUnload)
        return () => window.removeEventListener("unload", handleUnload)
    }, [sessionValid])

    // Show PopupAlert when sessionValid is false
    useEffect(() => {
        if (sessionValid === null) return
        if (sessionValid === false) setShowPopupAlert(true)
    }, [sessionValid])

    if (sessionValid === null) return <LoadingScreen />
    if (sessionValid === false && !sessionStorage.getItem("previewData")) {
        return <NotFound /> // When a user directly accesses /preview/random-slug
    }
    
    return (
        <div className="preview">
            <div className="preview-overlay" />
            <div className="blog-page">
                <section className="blog-content">
                    <header>
                        { previewData.title?.trim() === "" 
                            ?   <h1 className="title placeholder">
                                    Enter Your Title
                                </h1>
                            :   <h1 className="title">
                                    {previewData.title.trim().substring(0, 70)}
                                </h1>
                        }
                        <div className="goback-icon">
                            <IoChevronBackOutline />
                        </div>
                    </header>
                    
                    <main className="tiptap-result">
                        { previewData.content?.replace(/<\/?[^>]+(>|$)/g, "").replace(/&nbsp;/gi, "").trim().length === 0
                            ?   <p className="placeholder">
                                    Write your content...
                                </p>
                            :   parse(handleEmptyLine(previewData.content)) || 
                                <p className="placeholder">
                                    Write your content...
                                </p>
                        }
                    </main>

                    <footer>
                        <span className="author">
                            {user?.username}
                        </span>
                        <span className="timestamp">
                            <label>
                                {formatDayMonth(Date.now())}
                            </label>
                        </span>
                    </footer>
                </section>

                <section className="add-comment">
                    <button className="add-comment-btn">
                        <span className="add-comment-icon">
                            <LuCirclePlus />
                        </span>
                        <span>Comment</span>
                    </button>
                </section>

                <section className="comments no-children" />
                <Footer />
            </div>

            <div className={`indicator ${sessionValid ? "" : "disconnected"}`}>
                { sessionValid &&
                    <div>
                        <div className="outer-circle" />
                        <div className="inner-circle" />
                    </div>
                }
                <label>
                    {sessionValid ? "Previewing" : "Preview Disconnected"}
                </label>
            </div>

            <PopupAlert 
                popupContent={`This preview tab is disconnected and no longer reflects your updates. To continue previewing live changes, simply close this tab and re-open a new one.`}
                showPopupAlert={showPopupAlert}
                setShowPopupAlert={setShowPopupAlert}
            />
        </div>
    )
}

export default Preview

// © 2025 Pitipat Pattamawilai. All Rights Reserved.