import { Link } from "react-router-dom"
import BlogSnippet from "../../components/BlogSnippet/BlogSnippet"

const ProfileContent = ({ userData, userBlogs, isOwnProfile }) => {
    const hasNoBlogs = userBlogs.length === 0
    const hasOneBlog = userBlogs.length === 1

    return (
        <div className={`profile ${hasNoBlogs ? "no-blog" : ""}`}>
            <div className="container">
                <header>
                    <h2 className="username">
                        {userData.username}
                    </h2>
                    { isOwnProfile &&
                        <p className="email">
                            {userData.email}
                        </p>
                    }
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
                        userBlogs.map(blog => (
                            <Link to={`/blog/${blog.slug}`}
                                key={blog._id} 
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

export default ProfileContent

// © 2025 Pitipat Pattamawilai. All Rights Reserved.