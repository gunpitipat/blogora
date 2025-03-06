const express = require("express")
const router = express.Router()
const { createBlog, getAllBlogs, getBlog, deleteBlog, updateBlog } = require("../controllers/blogController")
const authenticateUser = require("../controllers/middleware/authMiddleware")

// Blogs
router.post("/create", authenticateUser, createBlog)
router.get("/blogs", getAllBlogs)
router.get("/blog/:slug", getBlog)
router.delete("/blog/:slug", authenticateUser, deleteBlog)
router.put("/blog/:slug", authenticateUser, updateBlog)

module.exports = router

// © 2025 Pitipat Pattamawilai. All Rights Reserved.