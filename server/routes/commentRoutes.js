const express = require("express")
const router = express.Router()
const { createComment, getComments, deleteComment } = require("../controllers/commentController")
const authenticateUser = require("../controllers/middleware/authMiddleware")

// Comments and Replies
router.post("/blog/:slug/comment", authenticateUser, createComment)
router.delete("/blog/comment/:commentId", authenticateUser, deleteComment)
// Get only comments for a blog
router.get("/blog/:slug/comments", getComments)

module.exports = router

// © 2025 Pitipat Pattamawilai. All Rights Reserved.