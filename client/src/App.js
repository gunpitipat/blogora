import "./App.css"
import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import ToolTip from "./components/ToolTip";
import SearchFilter from "./components/SearchFilter";
import { useLoadingContext } from "./services/LoadingContext";
import { useAuthContext } from "./services/AuthContext";
import { formatDayMonth } from "./services/serviceFunctions";
import { LuArrowUpToLine } from "react-icons/lu";

function App() {
  const [ blogs, setBlogs ] = useState([])

  const [ showToolTip, setShowToolTip ] = useState(false)

  const [ searchInput, setSearchInput ] = useState("")

  const [ showBackToTop, setShowBackToTop ] = useState(false)

  const { setLoading } = useLoadingContext()

  const { isAuthenticated, user } = useAuthContext()

  const fetchData = async ()=>{
    setLoading(true)
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/blogs`)
      setBlogs(response.data)
    } catch(err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line
  },[])

  // Showing ToopTip Once When Opening Browser
  useEffect(() => {
    const hasSeenToolTip = sessionStorage.getItem("tooltip_shown") // Check if "tooltip_show" exists in sessionStorage, if not it will return null
    if (!hasSeenToolTip) {
      setShowToolTip(true) // Show tooltip only if it hasn’t been seen
    }
    // eslint-disable-next-line
  },[])

  const closeToolTip = () => {
    setShowToolTip(false)
    sessionStorage.setItem("tooltip_shown","true") // set a flag to ensure it will only be shown once per each session
  }

  const searchingBlogs = (target) => {
    return blogs.filter(blog => {
      if (!target) return true; // If no search input, return all blogs

      const titleMatch = blog.title?.toLowerCase().includes(target.toLowerCase()) || false
      const contentMatch = blog.content?.toLowerCase().includes(target.toLowerCase()) || false
      const authorMatch = blog.author?.toLowerCase().includes(target.toLowerCase()) || false

      return titleMatch || contentMatch || authorMatch
    })
  }

  // Store scroll position
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem("scrollPosition", window.scrollY)
    }

    window.addEventListener("scroll", saveScroll)
    return () => window.removeEventListener("scroll", saveScroll)
  }, [])

  // Restore scroll position
  useEffect(() => {
    setTimeout(() => {
      if (blogs.length > 0) {
        const storedScroll = sessionStorage.getItem("scrollPosition") || 0
        if (storedScroll) {
          window.scrollTo(0, parseFloat(storedScroll))
        }
      }
    }, 50) // Small delay to ensure both blogs is updated and UI fully rendered. (blogs could be updated while UI might not yet fully rendered)
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
                <Link to={`/profile/${blog.author}`} className="author">{blog.author}</Link> &bull;&nbsp;
                <span>{formatDayMonth(blog.createdAt)}</span>
              </small>
            </div>
        )))}
        { !(isAuthenticated && user) && blogs.length > 0 && (showToolTip && <ToolTip closeToolTip={closeToolTip}/>)} {/* tips for new users having not loged in yet */}
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
