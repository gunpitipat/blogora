const express = require("express")
const { signup, login, logout, getProfile, getProfileBlogs } = require("../controllers/userController")
const authenticateUser = require("../controllers/middleware/authMiddleware")
const authStatusCheck = require("../controllers/frontendService/authStatusCheck")

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)
router.get("/profile/:username", authenticateUser, getProfile) // making it protected because this route provides user's username and email
router.get("/profile/:username/blogs", getProfileBlogs)


// authentication status check for frontend usage
router.get("/check-auth", authStatusCheck)

module.exports = router

// © 2025 Pitipat Pattamawilai. All Rights Reserved.