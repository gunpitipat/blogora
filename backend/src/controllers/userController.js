const Users = require("../models/usersModel")
const Blogs = require("../models/blogsModel")
const Comments = require("../models/commentsModel")
const bcrypt = require("bcrypt")

exports.signup = async (req, res) => {
    const { email, username, password, cfpassword } = req.body

    let indication = { success: [], error: [] }

    // Helper function to add error
    const addError = (field, message) => {
        indication.error.push({ field, message })
    }

   // Helper function to validate email
    const validateEmail = (email) => {
        // Regular expression: local part @ domain . TLD
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
            addError("email", "Email format is not correct.")
            return
        }
        indication.success.push("email")
    }

    // Helper function to validate username
    const validateUsername = async (username) => {
        if (username.includes(" ")) {
            addError("username", "Username cannot contain a space character.")
            return
        }
        if (!username || username.trim().length < 5) {
            addError("username", "Username must have at least 5 characters.")
            return
        }
        if (username.trim().length > 20) {
            addError("username", "Username cannot be longer than 20 characters.")
            return
        } else {
            // Check if username is already registered
            const existingUser = await Users.findOne({ username_lowercase: username.toLowerCase() })
            if (existingUser) {
                addError("username", "Your username has been used.")
                return
            }
            indication.success.push("username")
        }
    }

    // Helper function to validate password
    const validatePassword = (password, cfpassword) => {
        if (password.includes(" ")) {
            addError("password", "Password cannot contain a space character.")
            return
        } 
        if (!password || password.trim().length < 8) {
            addError("password", "Password must have at least 8 characters.")
            return
        }
        indication.success.push("password")

        if (!cfpassword) { 
            addError("cfpassword", "Confirm Password cannot be blank.")
            return
        } 
        if (cfpassword !== password) {
            addError("cfpassword", "Password doesn't match.")
            return
        }
        indication.success.push("cfpassword")
    }

    // Perform validations
    validateEmail(email)
    await validateUsername(username)
    validatePassword(password, cfpassword)
    
    // Return validation errors if any
    if (indication.error.length > 0) {
        return res.status(400).json(indication)
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)
        
        // Save user to database
        const newUser = await Users.create({
            email,
            username,
            username_lowercase: username.toLowerCase(),
            password: hashedPassword,
        })
        res.status(201).json({ message: "Account created successfully", user: newUser })
    
    } catch (err) {
        res.status(500).json({ message: "An error occurred while creating the user." })
    }
}

exports.signupDemo = async (req, res) => {
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
        res.status(201).json({ username: newUsername, password: newPassword })
    
    } catch (error) {
        res.status(500).json({ message: "Error creating demo user." })
    }
}

exports.getUserData = async (req, res) => {
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

exports.getUserBlogs = async (req, res) => {
    try {
        const { username } = req.params
        const userId = req.userId

        const user = await Users.findOne({ username_lowercase: username.toLowerCase() })
        if (!user) return res.status(404).json({ message: "User not found" })

        // Only allow the demo user to view their own profile
        if (user.role === "demo" && userId !== user._id.toString()) {
            return res.status(404).json({ message: "Profile not available" })
        }

        const blogs = await Blogs.find({ author: user._id })
            .sort({ isPinned: -1, createdAt: -1 }) // Newest first
            .populate({ path: "author", select: "username" })
        if (!blogs) return res.status(404).json({ message: "Blog not found" })

        res.status(200).json(blogs)
        
    } catch (error) {
        console.error("Error retrieving user's blogs", error)
        res.status(500).json({ message: "Error retrieving data from server" })
    }
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.