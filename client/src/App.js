import "./App.css"
import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import ToolTip from "./components/ToolTip";
import SearchFilter from "./components/SearchFilter";
import { useLoadingContext } from "./utils/LoadingContext";
import { useAuthContext } from "./utils/AuthContext";
import { formatDayMonth } from "./utils/serviceFunctions";
import { LuArrowUpToLine } from "react-icons/lu";
import { useAlertContext } from "./utils/AlertContext";
import { debounce } from "lodash"

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
    const hasSeenToolTip = sessionStorage.getItem("tooltip_shown") // If "tooltip_show" doesn't exist in sessionStorage, it returns null
    if (!hasSeenToolTip) {
      setShowToolTip(true) // Show tooltip only if it hasn’t been seen
    }
    // eslint-disable-next-line
  },[])

  const closeToolTip = () => {
    setShowToolTip(false)
    sessionStorage.setItem("tooltip_shown", "true") // Set a flag to ensure it will only be shown once per each session
  }

  const searchingBlogs = (target) => {
    return blogs.filter(blog => {
      if (!target) return true; // If no search input, return all blogs

      const titleMatch = blog.title?.toLowerCase().includes(target.toLowerCase()) || false
      const contentMatch = blog.content?.toLowerCase().includes(target.toLowerCase()) || false
      const authorMatch = blog.author?.username?.toLowerCase().includes(target.toLowerCase()) || false

      return titleMatch || contentMatch || authorMatch
    })
  }

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
        {blogs.length > 0 && (searchingBlogs(searchInput).map((blog,index)=>(
            <div className="blog" key={index}>
              <Link to={`/blog/${blog.slug}`} className="title"><h2>{blog.title}</h2></Link>
              <p>{blog.content.replace(/<\/?[^>]+(>|$)/g, " ").substring(0,250)}{blog.content.replace(/<\/?[^>]+(>|$)/g, " ").length > 250 ? " . . ." : null }</p>
              <small>
                <Link to={`/profile/${blog.author?.username}`} className="author">{blog.author?.username}</Link> &bull;&nbsp;
                <span>{formatDayMonth(blog.createdAt)}</span>
              </small>
            </div>
        )))}
        { !(isAuthenticated && user?.username) && blogs.length > 0 && (showToolTip && <ToolTip closeToolTip={closeToolTip}/>)} {/* For new users who have not logged in yet */}
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
