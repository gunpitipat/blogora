import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, Link } from "react-router-dom"
import "./Profile.css"
import { useLoadingContext } from "../utils/LoadingContext"
import LoadingScreen from "./LoadingScreen"
import NotFound from "./NotFound"
import { useAuthContext } from "../utils/AuthContext"
import { useAlertContext } from "../utils/AlertContext"
import BlogSnippet from "./BlogSnippet"

const Profile = () => {
    const { username: usernameParam } = useParams()
    const [ userData, setUserData ] = useState({ email: null, username: null })
    const [ userBlogs, setUserBlogs ] = useState([])    
    const [ profileExists, setProfileExists ] = useState(null)

    const { setLoading } = useLoadingContext()
    const { user } = useAuthContext()
    const { setAlertState } = useAlertContext()

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
            if (axios.isCancel(error)) { 
                return null
            }

            if (!error.response) {
                setAlertState({ display: true, type: "error", message: "Network error. Please try again." })
            } else {
                if (error.response.status === 500) {
                    setAlertState({ display: true, type: "error", message: error.response.data?.message || "Server error. Please try again later." })
                } else if (error.response.status === 404) {
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
            const response = await axios.get(`${process.env.REACT_APP_API}/profile/${usernameParam}/blogs`,
                { signal: abortSignal }
            )
            return response.data // [ blog documents ]
        } catch (error) {
            if (axios.isCancel(error)) {
                return null
            }
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
        // User has no blog
        if (userBlogs.length === 0) { 
            return (
                <div className="Profile No-Blog">
                    <div className="container">
                        <header>
                            <h2>{userData.username}</h2>
                            <p>{userData.email}</p>
                        </header>
                        <main> 
                            { user?.username === userData.username
                            ?   <div>
                                    <p>You do not have any blogs.</p>
                                    <Link to="/create"><h4>Create Your Blog</h4></Link>
                                </div>
                            // When users visit other's profile whose blog hasn't been created yet
                            :   <div>
                                    <p>No blogs here yet!</p>
                                    <Link to="/explore"><h4>Explore other blogs instead?</h4></Link>
                                </div>
                            }
                        </main>
                    </div>
                </div>
            )
        }

        // User has their own blogs
        else {
            return(
                <div className="Profile">
                    <div className="container">
                        <header>
                            <h2>{userData.username}</h2>
                            <p>{userData.email}</p>
                        </header>
                        <main className={userBlogs.length === 1 ? "single-blog" : ""}>
                            {userBlogs.map((blog, index) => {
                                return (
                                    <Link className="blog" key={index} to={`/blog/${blog.slug}`}>
                                        <BlogSnippet blog={blog} disableInnerLink />
                                    </Link>
                                )
                            })}
                        </main>
                    </div>
                </div>
            )
        }
    }
}

export default Profile

// © 2025 Pitipat Pattamawilai. All Rights Reserved.