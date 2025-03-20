const express = require("express")
const router = express.Router()
const { createComment, getComments, deleteComment } = require("../controllers/commentController")
const authMiddleware = require("../controllers/middleware/authMiddleware")

// Comments and Replies
router.post("/blog/:slug/comment", authMiddleware, createComment)
router.delete("/blog/comment/:commentId", authMiddleware, deleteComment)
// Get only comments for a blog
router.get("/blog/:slug/comments", getComments)

module.exports = router

// © 2025 Pitipat Pattamawilai. All Rights Reserved.