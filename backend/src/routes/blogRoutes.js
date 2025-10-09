const express = require("express")
const { createBlog, getAllBlogs, getBlog, deleteBlog, updateBlog } = require("../controllers/blogController")
const authMiddleware = require("../middleware/authMiddleware")
const demoContentFilter = require("../middleware/demoContentFilter")

const router = express.Router()

router.post("/create", authMiddleware, createBlog)
router.get("/blogs", demoContentFilter(), getAllBlogs)
router.get("/blog/:slug", demoContentFilter(true), getBlog)
router.put("/blog/:slug", authMiddleware, updateBlog)
router.delete("/blog/:slug", authMiddleware, deleteBlog)

module.exports = router

// © 2025 Pitipat Pattamawilai. All Rights Reserved.