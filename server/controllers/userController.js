const Users = require("../models/usersModel")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const Blogs = require("../models/blogsModel")
const Comments = require("../models/commentsModel")
const mongoose = require("mongoose")

// Sign up (create user)
exports.signup = async (req, res) => {
    const { email, username, password, cfpassword } = req.body

    let indication = { success: [], error: [] }

    // Helper function to add error
    const addError = (field, message) => {
        indication.error.push({ field, message });
    };

   // Helper function to validate email
    const validateEmail = (email) => {
        // Regular expression:   local part   @   domain      .   TLD
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        if (email.includes(" ")) {
            addError("email", "Email cannot contain a space character.")
            return
        }
        if (!email || email.trim() === "") {
            addError("email", "Email cannot be empty.")
            return
        }
        if (!emailRegex.test(email) || email.includes("..")) { // Disallow multiple consecutive dots
            addError("email", "Email format is not correct.");
            return
        }
        indication.success.push("email");
    };

    // Helper function to validate username
    const validateUsername = async (username) => {
        if (username.includes(" ")) {
            addError("username", "Username cannot contain a space character.");
            return
        }
        if (!username || username.trim().length < 5) {
            addError("username", "Username must have at least 5 characters.");
            return
        }
        if (username.trim().length > 20) {
            addError("username", "Username cannot be longer than 20 characters.")
            return
        } else {
            // Check if username is already registered
            const existingUser = await Users.findOne({ username_lowercase: username.toLowerCase() });
            if (existingUser) {
                addError("username", "Your username has been used.");
                return
            }
            indication.success.push("username");
        }
    };

    // Helper function to validate password
    const validatePassword = (password, cfpassword) => {
        if (password.includes(" ")) {
            addError("password", "Password cannot contain a space character.");
            return
        } 
        if (!password || password.trim().length < 8) {
            addError("password", "Password must have at least 8 characters.");
            return
        }
        indication.success.push("password");

        if (!cfpassword) { 
            addError("cfpassword", "Confirm Password cannot be blank.")
            return
        } 
        if (cfpassword !== password) {
            addError("cfpassword", "Password doesn't match.");
            return
        }
        indication.success.push("cfpassword");
    };

    // Perform validations
    validateEmail(email);
    await validateUsername(username);
    validatePassword(password, cfpassword);
    
    // Return validation errors if any
    if (indication.error.length > 0) {
        return res.status(400).json(indication);
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Save user to database
        const newUser = await Users.create({
            email,
            username,
            username_lowercase: username.toLowerCase(),
            password: hashedPassword,
        });
        res.status(201).json({ message: "Account created successfully", user: newUser });
    } catch (err) {
        res.status(500).json({ message: "An error occurred while creating the user." });
    }
};

// Create Demo user
exports.createDemoUser = async (req, res) => {
    try {
        // Saved credentials from localStorage
        const { savedUsername, savedPassword } = req.body

        if (savedUsername && savedPassword) {
            const demoUser = await Users.findOne({ role: "demo", username: savedUsername })

            // Return the same credentials if there's at least 3 mins left to perform login
            if (demoUser && demoUser.password && (demoUser.expiresAt - Date.now() >= 3 * 60 * 1000)) {
                const isMatch = await bcrypt.compare(savedPassword, demoUser.password)
                if (isMatch) {
                    return res.status(201).json({ username: savedUsername, password: savedPassword })
                }
            }
        }

        // Find the lowest available sequential username
        const existingDemoUsers = await Users.find({ role: "demo" }).select("username")
        const takenUsernames = new Set(existingDemoUsers.map(user => user.username))

        // In case where TTL deleted demo user but cron job hasn't deleted their blogs and comments yet
        const [existingDemoBlogAuthors, existingDemoCommentAuthors] = await Promise.all([
            Blogs.find({ isDemo: true }).distinct("demoAuthor"),
            Comments.find({ isDemo: true }).distinct("demoAuthor")
        ])
        const allExistingDemoAuthors = new Set([...existingDemoBlogAuthors, ...existingDemoCommentAuthors])
        allExistingDemoAuthors.forEach(username => {
            takenUsernames.add(username)
        })

        let newUsername = "DemoUser01"

        for (let i = 1; i <= takenUsernames.size + 1; i++) {
            const proposedUsername = `DemoUser${String(i).padStart(2, "0")}`
            if (!takenUsernames.has(proposedUsername)) {
                newUsername = proposedUsername
                break
            }
        }

        const newPassword = "TryDemo" + newUsername.slice(-2)
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        const expiresInMinutes = 15 // Threshold before login
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

        // Create a new demo user
        const demoUser = await Users.create({
            email: `${newUsername}@blogora.com`,
            username: newUsername,
            username_lowercase: newUsername.toLowerCase(),
            password: hashedPassword,
            role: "demo",
            expiresAt
        })
        res.status(201).json({ username: newUsername, password: newPassword });
    } catch (error) {
        res.status(500).json({ message: "Error creating demo user." });
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

// Logout
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
                }).select("_id").lean()  // Read only

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

// User's Profile
exports.getProfile = async (req, res) => {
    try {
        const { username } = req.params // Extract from URL
        const userId = req.userId // Extract from token payload

        const profile = await Users.findOne({ username_lowercase: username.toLowerCase() }).select("_id email username role")
        if (!profile) return res.status(404).json({ message: "User not found" })
        
        const isOwner = userId === profile._id.toString()

        // Only allow the demo user to view their own profile
        if (profile.role === "demo" && !isOwner) {
            return res.status(404).json({ message: "Profile not available" })
        }
        
        const userProfile = isOwner 
        ? { email: profile.email, username: profile.username } // Email is visible only to the owner
        : { username: profile.username }

        res.status(200).json(userProfile)

    } catch (error) {
        console.error("Error retrieving user's profile", error)
        res.status(500).json({ message: "Error retrieving data from server" })
    }
}

exports.getProfileBlogs = async (req, res) => {
    try {
        const { username } = req.params
        const userId = req.userId

        const user = await Users.findOne({ username_lowercase: username.toLowerCase() })
        if (!user) return res.status(404).json({ message: "User not found" })

        // Only allow the demo user to view their own profile
        if (user.role === "demo" && userId !== user._id.toString()) {
            return res.status(404).json({ message: "Profile not available" })
        }

        const blogs = await Blogs.find({ author: user._id }).populate({ path: "author", select: "username" })
        if (!blogs) return res.status(404).json({ message: "Blog not found" })

        res.status(200).json(blogs)

    } catch (error) {
        console.error("Error retrieving user's blogs", error)
        res.status(500).json({ message: "Error retrieving data from server" })
    }
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.