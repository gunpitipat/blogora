import "./Preview.css"
import { useState, useEffect } from "react"
import { IoChevronBackOutline } from "react-icons/io5";
import parser from "html-react-parser"
import { useAuthContext } from "../../contexts/AuthContext";
import { formatDayMonth } from "../../utils/formatDateUtils";
import { LuCirclePlus } from "react-icons/lu";
import { useLocation, useParams } from "react-router-dom";
import NotFound from "../NotFound/NotFound";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import PopupAlert from "../../components/Popups/PopupAlert";
import { handleEmptyLine } from "../../utils/contentUtils";
import Footer from "../../components/Layout/Footer";

const Preview = () => {
    const { slug } = useParams()
    const [sessionValid, setSessionValid] = useState(null)
    const location = useLocation()

    const [previewData, setPreviewData] = useState({ title: "", content: "" })

    const [ showPopupAlert, setShowPopupAlert ] = useState(false)

    const { user } = useAuthContext()

    // Validate and set a flag when preview opens
    useEffect(() => {        
        sessionStorage.setItem("previewSync", slug) // To verify sync between Form and Preview

        // Check if preview is opened and controllable by Form
        const validatePreview = () => {
            // If a user navigates away regardless of whether they return or not
            if (sessionStorage.getItem("previousPath") && (sessionStorage.getItem("previousPath") !== sessionStorage.getItem("previewSync"))) {
                setSessionValid(false)
                localStorage.setItem("previewOpen", "false") // Notify Form
            } else if (localStorage.getItem("formSync") === sessionStorage.getItem("previewSync")) {
                localStorage.setItem("previewOpen", "true") // Set a flag if it's controllable
                setSessionValid(true)
            } else {
                setSessionValid(false)
            }
        }
        
        // Listen for formSync removing on Form unmount
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

    // Clean up localStorage by notifying Form
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (sessionValid) {
                localStorage.setItem("previewOpen", "false")
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [sessionValid])

    // Show PopupAlert when sessionValid is false
    useEffect(() => {
        if (sessionValid === null) return
        if (sessionValid === false) {
            setShowPopupAlert(true)
        }
    }, [sessionValid])

    if (sessionValid === null) return <LoadingScreen />
    if (sessionValid === false && !sessionStorage.getItem("previewData")) {
        return <NotFound /> // When a user directly accesses /preview/random-slug
    }
    
    return (
        <div className="Preview">
            <div className="preview-overlay"></div>
            <div className="BlogPage">
                <div className="blog-section">
                    <header>
                        <div className="goback-icon">
                            <IoChevronBackOutline />
                        </div>
                        {previewData.title?.trim() === "" 
                            ? <h1 className="title placeholder">Enter Your Title</h1>
                            : <h1 className="title">
                                {previewData.title.trim().substring(0, 60)}
                              </h1>
                        }
                    </header>
                    <main className="TipTap-Result">
                        {previewData.content?.replace(/<\/?[^>]+(>|$)/g, "").replace(/&nbsp;/gi, "").trim().length === 0
                            ? <p className="placeholder">Write your content...</p>
                            : parser(handleEmptyLine(previewData.content)) || <p className="placeholder">Write your content...</p>
                        }
                    </main>
                    <footer>
                        <span className="author">
                            {user?.username}
                        </span>
                        <span className="timestamp">
                            <label>{formatDayMonth(Date.now())}</label>
                        </span>
                    </footer>
                </div>
                <section className="blog-comment">
                    <button className="comment-button">
                        <span className="comment-icon">
                            <LuCirclePlus />
                        </span>
                        <span>Comment</span>
                    </button>
                </section>
                <section className="comments no-children"></section>
            </div>
            <div className={`indicator ${sessionValid ? "" : "disconnected"}`}>
                {sessionValid &&
                <div>
                    <div className="outer-circle"></div>
                    <div className="inner-circle"></div>
                </div>
                }
                <label>{sessionValid ? "Previewing" : "Preview Disconnected"}</label>
            </div>
            <Footer />
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