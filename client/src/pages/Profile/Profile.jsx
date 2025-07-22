import "./Profile.css"
import axios from "axios"
import { useEffect, useState } from "react"
import { useParams, Link, useLocation } from "react-router-dom"
import { useAuthContext } from "../../contexts/AuthContext"
import { useAlertContext } from "../../contexts/AlertContext"
import { useLoadingContext } from "../../contexts/LoadingContext"
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen"
import NotFound from "../NotFound/NotFound"
import BlogSnippet from "../../components/BlogSnippet/BlogSnippet"

const Profile = () => {
    const { username: usernameParam } = useParams()
    const [userData, setUserData] = useState({ email: null, username: null })
    const [userBlogs, setUserBlogs] = useState([])    
    const [profileExists, setProfileExists] = useState(null)

    const { setLoading } = useLoadingContext()
    const { user, setSessionExpired } = useAuthContext()
    const { setAlertState } = useAlertContext()
    const location = useLocation()

    // Get personal user data
    const getUserData = async (abortSignal) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/profile/${usernameParam}`, {
                withCredentials: true,
                signal: abortSignal // Pass abortController signal to link the request with abortController
            })
            return response.data // User exists -> { email ?, username }
        
        } catch (error) {
            // Ignore request cancellation errors to avoid unnecessary logs
            if (axios.isCancel(error)) return null

            if (!error.response) {
                setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
            } else {
                if (error.response.status === 500) {
                    setAlertState({ display: true, type: "error", message: error.response.data?.message || "Server error. Please try again later." })
                } else if (error.response.status === 404) {

                    // Show session expiration modal if demo user got TTL-deleted and visits their profile
                    if (location.pathname === `/profile/${user?.username}`) {
                        setSessionExpired(true)
                    }

                    throw error // Suppress 404 error logging but still throw them so Promise.allSettled() marks as "rejected"
                }
            }
            console.error("Error fetching user data")
            throw error // Rethrow caught error to be handled by a higher level handler (e.g., Promise.allSetled())
        }
    }

    // Get all user's blogs
    const getUserBlogs = async (abortSignal) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/profile/${usernameParam}/blogs`, { 
                withCredentials: true,
                signal: abortSignal 
            })
            return response.data // [ blog documents ]

        } catch (error) {
            if (axios.isCancel(error)) return null
            
            if (error.response && error.response.status === 404) {
                throw error
            }
            console.error("Error fetching user blogs")
            throw error
        }
    }

    useEffect(() => {
        if (!usernameParam) return // Prevent fetching when username is undefined initially

        const controller = new AbortController() // For cleanup (request cancellation) when component unmounts
        const { signal } = controller

        const fetchData = async () => {
            setLoading(true)
            setProfileExists(null)
            setUserData({ email: null, username: null })
            setUserBlogs([])

            // Promise.allSettled() never rejects. It returns an array. catch block in fetchData() will never run
            // The rejected promise inside will store the error in reason instead of throwing it
            try {
                const [userDataResult, userBlogsResult] = await Promise.allSettled([ // Run both API requests concurrently, ensuring run to completion, even if one fails
                    getUserData(signal), 
                    getUserBlogs(signal)
                ]) 

                // Check if getUserData resolves successfully
                if (userDataResult.status === "fulfilled" && userDataResult.value) { // Ensure userDataResult.value exists before accessing its properties
                    setUserData({ email: userDataResult.value?.email || null, username: userDataResult.value?.username })
                    setProfileExists(true)
                } else if (userDataResult.status === "rejected") {
                    // Verify it's an Axios error before checking its status code (404)
                    if (axios.isAxiosError(userDataResult.reason) && userDataResult.reason.response?.status === 404) {
                        setProfileExists(false) // Only set to false when getUserData fails with a 404
                    } else {
                    // Prevent users from getting stuck in LoadingScreen in case of network / server error
                        setProfileExists(true) // Show a blank page with alert message
                    }
                }

                if (userBlogsResult.status === "fulfilled" && userBlogsResult.value) {
                    setUserBlogs(userBlogsResult.value)
                }
                
            } finally {
                setLoading(false)
            }
        }

        fetchData()

        return () => controller.abort() // Cleanup to avoid memory leaks
        // eslint-disable-next-line
    }, [usernameParam])

    if (profileExists === null) return <LoadingScreen />
    if (profileExists === false) return <NotFound />
    if (profileExists && userData.username) {
        const hasNoBlogs = userBlogs.length === 0
        const isOwnProfile = user?.username === userData.username
        const hasOneBlog = userBlogs.length === 1

        return (
            <div className={`profile ${hasNoBlogs ? "no-blog" : ""}`}>
                <div className="container">
                    <header>
                        <h2 className="username">
                            {userData.username}
                        </h2>
                        <p className="email">
                           {userData.email} 
                        </p>
                    </header>
                    <main className={hasOneBlog ? "single-blog" : ""}>
                        { hasNoBlogs ? (
                            <div className="profile-card">
                                { isOwnProfile ? (
                                    <>
                                        <p>You do not have any blogs.</p>
                                        <Link to="/create">
                                            <h4>Create Your Blog</h4>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <p>No blogs here yet!</p>
                                        <Link to="/explore">
                                            <h4>Explore other blogs instead?</h4>
                                        </Link>
                                    </>
                                )}
                            </div>
                        ) : (
                            userBlogs.map((blog, index) => (
                                <Link to={`/blog/${blog.slug}`}
                                    key={index} 
                                    className="profile-card link" 
                                >
                                    <BlogSnippet 
                                        blog={blog} 
                                        disableInnerLink 
                                    />
                                </Link>
                            ))
                        )}
                    </main>
                </div>
            </div>
        )
    }
}

export default Profile

// © 2025 Pitipat Pattamawilai. All Rights Reserved.