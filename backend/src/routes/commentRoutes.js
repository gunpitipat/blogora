const express = require("express")
const { createComment, getComments, deleteComment } = require("../controllers/commentController")
const authMiddleware = require("../middleware/authMiddleware")
const demoContentFilter = require("../middleware/demoContentFilter")

const router = express.Router()

router.post("/blog/:slug/comment", authMiddleware, createComment)
router.delete("/blog/comment/:commentId", authMiddleware, deleteComment)
router.get("/blog/:slug/comments", demoContentFilter(), getComments)

module.exports = router

// © 2025 Pitipat Pattamawilai. All Rights Reserved.