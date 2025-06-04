import "./Explore.css"
import { useState, useEffect, useMemo, useRef } from "react"
import axios from "axios"
import WelcomeTooltip from "./WelcomeTooltip";
import SearchFilter from "./SearchFilter";
import { useAuthContext } from "../../contexts/AuthContext";
import { LuArrowUpToLine } from "react-icons/lu";
import { useAlertContext } from "../../contexts/AlertContext";
import { debounce } from "lodash"
import BlogSnippet from "../../components/BlogSnippet/BlogSnippet";
import Skeleton from "./Skeleton";

function Explore() {
  const [ blogs, setBlogs ] = useState([])
  const [ showTooltip, setShowTooltip ] = useState(false)
  const [ searchInput, setSearchInput ] = useState("")
  const [ showBackToTop, setShowBackToTop ] = useState(false)
  const [ isLoading, setIsLoading ] = useState(true)

  const hasRestoredScroll = useRef(false)

  const { isAuthenticated, user } = useAuthContext()
  const { setAlertState } = useAlertContext()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/blogs`, {
        withCredentials: true
      })
      setBlogs(response.data)
    } catch (error) {
      if (!error.response) {
        setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
      } else {
        setAlertState({ display: true, type: "error", message: error.response.data?.message || "Server error. Please try again later." })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line
  },[])

  // Showing ToopTip once when opening browser
  useEffect(() => {
    const hasSeenTooltip = sessionStorage.getItem("tooltip_shown")
    if (!hasSeenTooltip) {
      setShowTooltip(true) // Show tooltip only if it hasn’t been seen
    }
    // eslint-disable-next-line
  }, [])

  const closeTooltip = () => {
    setShowTooltip(false)
    sessionStorage.setItem("tooltip_shown", "true") // Set a flag to ensure it will only be shown once per each session
  }

  const filteredBlogs = useMemo(() => {
    if (!searchInput) return blogs

    const lowerInput = searchInput.toLowerCase()

    return blogs.filter(blog => {
      return (
        blog.title?.toLowerCase().includes(lowerInput) ||
        blog.content?.toLowerCase().includes(lowerInput) ||
        blog.author?.username?.toLowerCase().includes(lowerInput)
      )
    })
  }, [searchInput, blogs])

  // Save scroll position
  useEffect(() => {
    const saveScroll = debounce(() => {
      if (hasRestoredScroll.current) {
        sessionStorage.setItem("scrollPosition", window.scrollY)
      }
    }, 100)

    if (blogs.length > 0) { // Prevent storing (overwriting) new scroll position before restoring the previous one properly
      window.addEventListener("scroll", saveScroll)
    }

    return () => window.removeEventListener("scroll", saveScroll)
  }, [blogs])

  // Restore scroll position
  useEffect(() => {
    if (blogs.length > 0 && !hasRestoredScroll.current) {
      const storedScroll = sessionStorage.getItem("scrollPosition") || 0
      if (storedScroll) {
        window.scrollTo(0, parseFloat(storedScroll))
      }
      hasRestoredScroll.current = true
    }
}, [blogs])

  // Show/hide back-to-top button
  useEffect(() => {
    const handleButton = () => {
      if (window.scrollY > 200) {
        setShowBackToTop(true)
      } else {
        setShowBackToTop(false)
      }
    }

    window.addEventListener("scroll", handleButton)
    return () => window.removeEventListener("scroll", handleButton)
  }, [])

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      <div className="Explore">
        <SearchFilter searchInput={searchInput} setSearchInput={setSearchInput}/>

        {isLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} contentLineCount={6} />
          ))
        ) : (
          filteredBlogs.length > 0 && filteredBlogs.map((blog, index) => {
            return <BlogSnippet key={index} blog={blog} />
          })
        )}

        {/* For new users who have not logged in yet */}
        { !(isAuthenticated && user?.username) && blogs.length > 0 && (showTooltip && <WelcomeTooltip closeTooltip={closeTooltip}/>)}
        
        <div className={`back-to-top-button ${showBackToTop ? "show" : ""}`} onClick={backToTop}>
          <LuArrowUpToLine />
        </div>
      </div>
      
      <footer className="copyright">
        <small>&copy; 2025 Pitipat Pattamawilai. All Rights Reserved.</small>
      </footer>
    </>
  );
}

export default Explore;

// © 2025 Pitipat Pattamawilai. All Rights Reserved.
