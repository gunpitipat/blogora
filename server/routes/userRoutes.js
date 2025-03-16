const express = require("express")
const { signup, login, logout, getProfile, getProfileBlogs } = require("../controllers/userController")
const authenticateUser = require("../controllers/middleware/authMiddleware")
const authStatusCheck = require("../controllers/frontendService/authStatusCheck")

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)
router.get("/profile/:username", authenticateUser, getProfile) // authenticateUser is needed to prevent others' emails from being exposed
router.get("/profile/:username/blogs", getProfileBlogs)


// Authentication status check for frontend usage
router.get("/check-auth", authStatusCheck)

module.exports = router

// © 2025 Pitipat Pattamawilai. All Rights Reserved.