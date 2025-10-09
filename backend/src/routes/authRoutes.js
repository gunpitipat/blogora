const express = require("express")
const { checkAuthStatus, login, logout } = require("../controllers/authController")
const noCache = require("../middleware/noCache")

const router = express.Router()

router.get("/check-auth", noCache, checkAuthStatus)
router.post("/login", login)
router.post("/logout", logout)

module.exports = router

// © 2025 Pitipat Pattamawilai. All Rights Reserved.