const mongoose = require("mongoose")
const Users = require("../models/usersModel")
const Blogs = require("../models/blogsModel")
const Comments = require("../models/commentsModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

exports.checkAuthStatus = (req, res) => {
    const token = req.cookies.token

    if (!token) return res.status(401).json({ isAuthenticated: false })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        res.status(200).json({ isAuthenticated: true, username: decoded.username, role: decoded.role })
    
    } catch (error) {
        res.status(403).json({ isAuthenticated: false }) // Invalid or expired token
    }
}

// Login (create authentication token and cookie)
exports.login = async (req, res) => {
    const { username, password } = req.body

    const validation = async (username, password) => {
        // Validate username
        if (!username) return { message: "Username cannot be blank.", field: "username" }

        const existingUser = await Users.findOne({ username })
        if (!existingUser) return { message: "This username has not been registered.", field: "username" }

        // Validate password
        const isMatch = await bcrypt.compare(password, existingUser.password)
        if (!isMatch) return { message: "Incorrect Password", field: "password" }

        return { success: { user: existingUser } }
    }

    try {
        const result = await validation(username, password)

        if (result.message) {
            return res.status(400).json({ message: result.message, field: result.field })
        }

        const user = result.success.user

        // Default for normal users
        let expiresIn = "1d" // for JWT token
        let maxAge = 1000 * 60 * 60 * 24 // 1 day for cookie

        if (user.role === "demo") {
            // Extend demo session to 30 mins
            expiresIn = "30m"
            maxAge = 1000 * 60 * 30

            user.expiresAt = new Date(Date.now() + maxAge)
            await user.save()
        }
        
        // Validation passed -> Create token
        const payload = { username: user.username, userId: user._id, role: user.role }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn }) 
        // Set HttpOnly Cookie
        res.cookie("token", token, {
            httpOnly: true, // Prevent javascript access (XSS attacks)
            secure: true, // Ensure it's sent over HTTPS
            sameSite: "none", // Allow cross-site/origin requests (different frontend & backend domains)
            maxAge,
            path: "/"
        })
        res.status(200).json({
            message: "Login Successful",
            username: user.username
        })
    
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "An error occurred while logging in." })
    }
}

exports.logout = async (req, res) => {
    try {
        // If demo user, clean it up
        const token = req.cookies.token

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            if (decoded.role === "demo") {
                // Clean up demo user
                await Users.deleteOne({ _id: decoded.userId })

                // Clean up demo blogs
                await Blogs.deleteMany({ isDemo: true, demoAuthor: decoded.username })

                // Find demo comments
                const demoComments = await Comments.find({ 
                        isDemo: true, 
                        demoAuthor: decoded.username 
                    }).select("_id blog")

                // Group comment IDs per blog
                const blogUpdatesMap = new Map()
                demoComments.forEach(comment => {
                    const blogId = comment.blog.toString()
                    if (!blogUpdatesMap.has(blogId)) {              //  {
                        blogUpdatesMap.set(blogId, [])              //    blogId1: [commentId1, commentId2]
                    }                                               //    blogId2: [commentId3], ...
                    blogUpdatesMap.get(blogId).push(comment._id)    //  }
                })

                const blogIds = Array.from(blogUpdatesMap.keys()).map(blogId => new mongoose.Types.ObjectId(blogId)) // Map back to ObjectId for query

                // Get only normal blogs
                const normalBlogs = await Blogs.find({
                    _id: { $in: blogIds },
                    isDemo: false
                }).select("_id").lean() // Read only

                // Remove ref comment IDs from normal blogs
                for (const blog of normalBlogs) {
                    const commentIds = blogUpdatesMap.get(blog._id.toString()) // Map keys are stored as Strings
                    await Blogs.findByIdAndUpdate(blog._id, {
                        $pull: { comments: { $in: commentIds } }
                    })
                }

                // Delete demo comments
                await Comments.deleteMany({ isDemo: true, demoAuthor: decoded.username })
            }
        }

    } catch {
        // If cookie/token is expired or invalid, TTL already deleted demo user
    }

    // Clear cookie regardless
    res.cookie("token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        expires: new Date(0) // Expire immediately
    })

    res.status(200).json({ message: "Logged out successfully" })
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.