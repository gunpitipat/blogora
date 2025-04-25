const express = require("express")
const router = express.Router()
const { createBlog, getAllBlogs, getBlog, deleteBlog, updateBlog } = require("../controllers/blogController")
const authMiddleware = require("../controllers/middleware/authMiddleware")
const allBlogFilterMiddleware = require("../controllers/middleware/allBlogFilterMiddleware")
const blogFilterMiddleware = require("../controllers/middleware/blogFilterMiddleware")

// Blogs
router.post("/create", authMiddleware, createBlog)
router.get("/blogs", allBlogFilterMiddleware, getAllBlogs)
router.get("/blog/:slug", blogFilterMiddleware, getBlog)
router.delete("/blog/:slug", authMiddleware, deleteBlog)
router.put("/blog/:slug", authMiddleware, updateBlog)

module.exports = router

// © 2025 Pitipat Pattamawilai. All Rights Reserved.