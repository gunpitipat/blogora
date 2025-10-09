const express = require("express")
const { signup, signupDemo, getUserData, getUserBlogs } = require("../controllers/userController")
const attachUserId = require("../middleware/attachUserId")

const router = express.Router()

router.post("/signup", signup)
router.post("/demo/signup", signupDemo)
router.get("/profile/:username", attachUserId, getUserData)
router.get("/profile/:username/blogs", attachUserId, getUserBlogs)

module.exports = router

// © 2025 Pitipat Pattamawilai. All Rights Reserved.