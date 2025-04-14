import "./App.css"
import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import ToolTip from "./components/ToolTip";
import SearchFilter from "./components/SearchFilter";
import { useLoadingContext } from "./utils/LoadingContext";
import { useAuthContext } from "./utils/AuthContext";
import { LuArrowUpToLine } from "react-icons/lu";
import { useAlertContext } from "./utils/AlertContext";
import { debounce } from "lodash"
import BlogSnippet from "./components/BlogSnippet";

function App() {
  const [ blogs, setBlogs ] = useState([])
  const [ showToolTip, setShowToolTip ] = useState(false)
  const [ searchInput, setSearchInput ] = useState("")
  const [ showBackToTop, setShowBackToTop ] = useState(false)
  const { setLoading } = useLoadingContext()
  const { isAuthenticated, user } = useAuthContext()
  const { setAlertState } = useAlertContext()

  const fetchData = async ()=>{
    setLoading(true)
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/blogs`)
      setBlogs(response.data)
    } catch(error) {
      if (!error.response) {
        setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
      } else {
        setAlertState({ display: true, type: "error", message: error.response.data?.message || "Server error. Please try again later." })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line
  },[])

  // Showing ToopTip once when opening browser
  useEffect(() => {
    const hasSeenToolTip = sessionStorage.getItem("tooltip_shown")
    if (!hasSeenToolTip) {
      setShowToolTip(true) // Show tooltip only if it hasn’t been seen
    }
    // eslint-disable-next-line
  },[])

  const closeToolTip = () => {
    setShowToolTip(false)
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

  // Store scroll position
  useEffect(() => {
    const saveScroll = debounce(() => {
      sessionStorage.setItem("scrollPosition", window.scrollY)
    }, 100)

    if (blogs.length > 0) { // Prevent storing (overwriting) new scroll position before restoring the previous one properly
      window.addEventListener("scroll", saveScroll)
    }

    return () => window.removeEventListener("scroll", saveScroll)
  }, [blogs])

  // Restore scroll position
  useEffect(() => {
    setTimeout(() => {
      if (blogs.length > 0) {
        const storedScroll = sessionStorage.getItem("scrollPosition") || 0
        if (storedScroll) {
          window.scrollTo(0, parseFloat(storedScroll))
        }
      }
    }, 50) // Small delay to ensure both blogs is updated and UI is "fully" rendered
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
      <div className="App">
        <SearchFilter searchInput={searchInput} setSearchInput={setSearchInput}/>

        {filteredBlogs.length > 0 && filteredBlogs.map((blog, index) => {
          return <BlogSnippet key={index} blog={blog} />
        })}

        {/* For new users who have not logged in yet */}
        { !(isAuthenticated && user?.username) && blogs.length > 0 && (showToolTip && <ToolTip closeToolTip={closeToolTip}/>)}
        
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

export default App;

// © 2025 Pitipat Pattamawilai. All Rights Reserved.
