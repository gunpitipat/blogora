const express = require("express")
const { signup, createDemoUser, login, logout, getProfile, getProfileBlogs } = require("../controllers/userController")
const authStatusCheck = require("../controllers/frontendService/authStatusCheck")
const profileMiddleware = require("../controllers/middleware/profileMiddleware")
const noCacheMiddleware = require("../controllers/middleware/noCacheMiddleware")

const router = express.Router()

router.post("/signup", signup)
router.post("/demo/signup", createDemoUser)
router.post("/login", login)
router.post("/logout", logout)
router.get("/profile/:username", profileMiddleware, getProfile)
router.get("/profile/:username/blogs", profileMiddleware, getProfileBlogs)

// Authentication status check for frontend usage
router.get("/check-auth",noCacheMiddleware, authStatusCheck)

module.exports = router

// © 2025 Pitipat Pattamawilai. All Rights Reserved.