const express = require("express")
const router = express.Router()
const { createBlog, getAllBlogs, getBlog, deleteBlog, updateBlog } = require("../controllers/blogController")
const authMiddleware = require("../controllers/middleware/authMiddleware")
const demoContentFilter = require("../controllers/middleware/demoContentFilter")

// Blogs
router.post("/create", authMiddleware, createBlog)
router.get("/blogs", demoContentFilter(), getAllBlogs)
router.get("/blog/:slug", demoContentFilter(true), getBlog)
router.delete("/blog/:slug", authMiddleware, deleteBlog)
router.put("/blog/:slug", authMiddleware, updateBlog)

module.exports = router

// © 2025 Pitipat Pattamawilai. All Rights Reserved.