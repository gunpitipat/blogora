import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, Link, useNavigate } from "react-router-dom"
import "./Profile.css"
import { useLoadingContext } from "../services/LoadingContext"
import LoadingScreen from "./LoadingScreen"
import NotFound from "./NotFound"
import { useAuthContext } from "../services/AuthContext"
import { formatDayMonth } from "../services/serviceFunctions"

const Profile = () => {

    const { username: usernameParam } = useParams()
    const [ userData, setUserData ] = useState({ email: null, username: null })
    const [ userBlogs, setUserBlogs ] = useState([])    
    const [ profileExists, setProfileExists ] = useState(null)

    const navigate = useNavigate()

    const { setLoading } = useLoadingContext()
    const { user } = useAuthContext()

    // Get personal user data
    const getUserData = async (abortSignal) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/profile/${usernameParam}`,{
                withCredentials: true,
                signal: abortSignal // passes abortController signal to link the request with abortController
            })
                return response.data // User exists => { email ?, username }
        } catch (error) {
            if (!axios.isCancel(error)) { // If the error is due to request cancellation, it will be ignored, preventing unnecessary error logs.
                console.error("Error fetching user data:", error)
                throw error // rethrow caught error so that it can be handled at a higher level (Promise.allSetled() in this case)
            }
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
            if (!axios.isCancel(error)) {
                console.error("Error fetching user blogs:", error)
                throw error
            }
        }
    }

    useEffect(() => {
        if (!usernameParam) return // Prevent fetching when username is undefined initially

        const controller = new AbortController() // for cleanup (request cancellation) when component unmounted
        const { signal } = controller

        const fetchData = async () => {
            setLoading(true)
            setProfileExists(null)
            setUserData({ email: null, username: null })
            setUserBlogs([])

            try {
                const [userDataResult, userBlogsResult] = await Promise.allSettled([ // making both API requests start at the same time (Promise.allSettled() ensures both promises run to completion, even if one fails)
                    getUserData(signal), 
                    getUserBlogs(signal)
                ]) 

                // Check if getUserData is successful before using its return value
                if (userDataResult.status === "fulfilled" && userDataResult.value) { // ensure userDataResult.value exists before accessing its property like email and username
                    setUserData({ email: userDataResult.value.email || null, username: userDataResult.value.username })
                    setProfileExists(true)
                } else {
                    // setProfileExists(false)
                }

                if (userBlogsResult.status === "fulfilled") {
                    setUserBlogs(userBlogsResult.value)
                }
            } catch (error) {
                    console.error("Error occurred in fetchData:", error)
                    setProfileExists(false) // Only set profileExists(false) if error isn't from request cancellation
            } finally {
                setLoading(false)
            }
        }

        fetchData()

        return () => controller.abort() // Cleanup to avoid memory leaks
        // eslint-disable-next-line
    }, [usernameParam])


    const goToBlog = (slug) => {
        navigate(`/blog/${slug}`)
    }

    if (profileExists === null) return <LoadingScreen />
    if (profileExists === false) return <NotFound />
    if (profileExists && userData.username) {
        // User has no blog (or data has not been fetched completely)
        if (userBlogs.length === 0) { 
            return (
                <div className="Profile No-Blog">
                    <div className="container">
                        <header>
                            <h2>{userData.username}</h2>
                            <p>{userData.email}</p>
                        </header>
                        <main> 
                            { user === userData.username
                            ?   <div>
                                    <p>You do not have any blogs.</p>
                                    <Link to="/create"><h4>Create Your Blog</h4></Link>
                                </div>
                            // when users visit other's profile whose blog hasn't been created yet
                            :   <div>
                                    <p>No blogs here yet!</p>
                                    <Link to="/"><h4>Explore other blogs instead?</h4></Link>
                                </div>
                            }
                        </main>
                    </div>
                </div>
            )
        }

        // Users have their own blogs
        else {
            return(
                <div className="Profile">
                    <div className="container">
                        <header>
                            <h2>{userData.username}</h2>
                            <p>{userData.email}</p>
                        </header>
                        <main className={userBlogs.length === 1 ? "single-blog" : null}>
                            {userBlogs.map((blog,index) => {
                                return(
                                    <div className="blog" key={index} onClick={()=>goToBlog(blog.slug)}>
                                        <div>
                                            <Link to={`/blog/${blog.slug}`}><h4>{blog.title}</h4></Link>
                                            <p>{blog.content.replace(/<\/?[^>]+(>|$)/g, " ").substring(0,100)}{blog.content.replace(/<\/?[^>]+(>|$)/g, " ").length > 250 ? " . . ." : null }</p>
                                            <small>{formatDayMonth(blog.createdAt)}</small>
                                        </div>
                                </div>
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