import "./Explore.css"
import api from "@/utils/api"
import { useState, useEffect, useMemo, useRef } from "react"
import { useLocation } from "react-router-dom"
import { useAlertContext } from "@/contexts/AlertContext"
import { useAuthContext } from "@/contexts/AuthContext"
import { debounce } from "lodash"
import Skeleton from "./Skeleton"
import SearchBar from "./SearchBar"
import WelcomeTooltip from "./WelcomeTooltip"
import BlogSnippet from "@/components/BlogSnippet/BlogSnippet"
import BackToTopButton from "@/components/Buttons/BackToTopButton"
import Footer from "@/components/Layout/Footer"

function Explore() {
  const [blogs, setBlogs] = useState([])
  const [showTooltip, setShowTooltip] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const hasRestoredScroll = useRef(false) // Prevent overwriting new scroll before restoring the previous one

  const { isAuthenticated, user } = useAuthContext()
  const { setAlertState } = useAlertContext()
  const location = useLocation()

  const isLoggedIn = isAuthenticated && user?.username

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await api.get("/blogs")
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  // Show Tooptip once per session
  useEffect(() => {
    const hasSeenTooltip = sessionStorage.getItem("tooltip_shown")
    if (!hasSeenTooltip) {
      setShowTooltip(true)
    }
  }, [])

  const closeTooltip = () => {
    setShowTooltip(false)
    sessionStorage.setItem("tooltip_shown", "true") // Set a flag to ensure it shows only once per each session
  }

  // Save scroll position
  useEffect(() => {
    const saveScroll = debounce(() => {
      if (location.pathname === "/explore" && hasRestoredScroll.current) {
        sessionStorage.setItem("/explore-scrollY", window.scrollY.toString())
      }
    }, 100)

    if (blogs.length > 0) {
      window.addEventListener("scroll", saveScroll)
    }

    return () => {
      window.removeEventListener("scroll", saveScroll)
      saveScroll.cancel?.()
    }
  }, [blogs, location.pathname])

  // Restore scroll position
  useEffect(() => {
    let timeout
    if (location.pathname === "/explore" && blogs.length > 0 && !hasRestoredScroll.current) {
      const storedScroll = sessionStorage.getItem("/explore-scrollY") || 0
      hasRestoredScroll.current = true

      timeout = setTimeout(() => {
        window.scrollTo(0, parseFloat(storedScroll))
      }, 0) // Ensure DOM layout updated
    }
    return () => clearTimeout(timeout)
  }, [blogs, location.pathname])

  const filteredBlogs = useMemo(() => {
    if (!searchInput) return blogs

    const lowerInput = searchInput.toLowerCase()

    return blogs.filter(blog => (
        blog.title?.toLowerCase().includes(lowerInput) ||
        blog.content?.toLowerCase().includes(lowerInput) ||
        blog.author?.username?.toLowerCase().includes(lowerInput)
    ))
  }, [searchInput, blogs])

  return (
    <div className="explore">
      <SearchBar 
        searchInput={searchInput} 
        setSearchInput={setSearchInput}
      />
      { isLoading 
        ? Array.from({ length: 2 }).map((_, index) => (
            <Skeleton 
              key={index} 
              contentLineCount={6} 
            />
          ))
        : filteredBlogs.length > 0 && 
          filteredBlogs.map((blog, index) => (
            <BlogSnippet 
              key={index} 
              blog={blog} 
            />
          ))
      }
      {/* For users not logged in */}
      { !isLoggedIn && blogs.length > 0 && showTooltip && 
        <WelcomeTooltip closeTooltip={closeTooltip} />
      }
      <BackToTopButton />
      <Footer />
    </div>
  )
}

export default Explore

// © 2025 Pitipat Pattamawilai. All Rights Reserved.
