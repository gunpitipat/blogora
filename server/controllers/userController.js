const Users = require("../models/usersModel")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const Blogs = require("../models/blogsModel")

// Sign Up (create user)
exports.signup = async (req,res) => {
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

// Login (create authentication token and cookie)
exports.login = async (req,res) => {
    const { username, password } = req.body

    const validation = async (username, password) => {
        // Validate username
        if (!username) return { message: "Username cannot be blank.", field: "username" }

        const existingUser = await Users.findOne({ username })
        if (!existingUser) return { message: "This username has not been registered.", field: "username" }

        // Validate password
        const isMatch = await bcrypt.compare(password,existingUser.password)
        if (!isMatch) return { message: "Incorrect Password", field: "password" }

        return { success: { user: existingUser } }
    }

    try {
        const result = await validation(username,password)

        if (result.message) {
            return res.status(400).json({ message: result.message, field: result.field })
        }
        
        // Validation passed => Create token
        const payload = { username: result.success.user.username, userId: result.success.user._id, role: result.success.user.role }
        const token = jwt.sign( payload, process.env.JWT_SECRET, { expiresIn: "1d" })
        // Set HttpOnly Cookie
        res.cookie("token", token, {
            httpOnly: true, // Prevent javascript access (XSS attacks)
            secure: true, // Ensure it's sent over HTTPS (set false for local development since http://localhost runs on http not https, so the browser ignores the cookie)
            sameSite: "none", // Allow cross-site/origin requests (different frontend & backend domains)
            maxAge: 1000 * 60 * 60 * 24, // 1 day expiration
            path: "/"
        })
        res.status(200).json({
            message: "Login Successful",
            username: result.success.user.username
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "An unexpected error occurred." })
    }
}

// Logout
exports.logout = (req,res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        domain: "localhost",
        path: "/",
        expires: new Date(0) // Expire immediately
    })
    res.status(200).json({ message: "Logged out successfully" })
}

// User's Profile
exports.getProfile = (req,res) => {
    const { username: usernameParam } = req.params // Extract from url
    const username = req.username // Extract from token payload
    Users.findOne({ username: usernameParam }).select("email username")
    .then(user => {
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const isOwner = username === usernameParam // If request is sent from user who doesn't belong to the document, respond only username (not email)
        const userData = isOwner
        ? { email: user.email, username: user.username }
        : { username: user.username }

        res.status(200).json(userData)
    })
    .catch(error => {
        console.error("Error retrieving user data", error)
        res.status(500).json({ message: "Error retrieving data from server" })
    })
}
exports.getProfileBlogs = (req,res) => {
    const { username } = req.params
    Blogs.find({ author: username })
    .then(allBlogs => {
        if (!allBlogs) {
            res.status(404).json({ message: "User not found" })
        }
        res.status(200).json(allBlogs)
    })
    .catch(err => {
        console.error(err)
        res.status(500).json({ message: "Error retrieving data from server" })
    })
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.