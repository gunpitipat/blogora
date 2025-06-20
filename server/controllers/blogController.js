const slugify = require("slugify")
const Blogs = require("../models/blogsModel")
const { v4: uuidv4 } = require('uuid');
const Comments = require("../models/commentsModel")

// Create blog
exports.createBlog = async (req,res) => {
    const { title, content } = req.body
    const trimmedTitle = title.trim()
    const userId = req.userId // Extracted from JWT token (authMiddleware)
    
    // For demo users
    const isDemo = req.userRole === "demo"
    const demoAuthor = isDemo ? req.username : undefined

    // Generate a unique slug from title
    const generateUniqueSlug = async (title) => {
        let slug = slugify(title, { lower: true, strict: true }) || uuidv4() // If title contains only non-Latin characters
        let existingBlog = await Blogs.findOne({ slug })
        let identificationNumber = 1
        while (existingBlog) {
            slug = slugify(`${title}-${identificationNumber}`, { lower: true, strict: true })
            existingBlog = await Blogs.findOne({ slug }) // Check again
            identificationNumber++
        }
        return slug
    }
    
    // Validate data
    switch (true) {
        case trimmedTitle.length === 0:
            return res.status(400).json({ message: "Please fill in your blog's title." })
        case trimmedTitle.length < 5:
            return res.status(400).json({ message: "Your title is too short." })
        case trimmedTitle.length > 60:
            return res.status(400).json({ message: "Your title is too long." })
        case content // Content stores as html. Empty character will be <p></p>, not ""
            .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
            .replace(/&nbsp;/gi, "")        // Remove &nbsp;
            .trim()
            .length === 0:
            return res.status(400).json({ message: "Your content is entirely blank." })
    }

    const slug = await generateUniqueSlug(trimmedTitle);

    // Create blog
    try {
        const blog = await Blogs.create({
            title: trimmedTitle,
            content,
            author: userId,
            slug,
            isDemo,
            demoAuthor
        })
        res.status(201).json({ blog, message: "Your blog has been posted!" })

    } catch (error) {
        console.error("Error creating blog", error)
        res.status(500).json({ message: "Error creating a blog" })
    }
}

// Get all blogs
exports.getAllBlogs = async (req,res) => {
    try {
        const filter = req.blogFilter
        const blogs = await Blogs.find(filter)
            .sort({ isPinned: -1, createdAt: -1 }) // Newest first
            .populate({ path: "author", select: "username" })

        res.status(200).json(blogs)

    } catch (error) {
        console.error("Error retrieving all blogs", error)
        res.status(500).json({ message: "Error retrieving data from server" })
    }
}

// Get single blog
exports.getBlog = async (req,res) => {
    try {
        const filter = req.blogFilter 
        const blog = await Blogs.findOne(filter).populate({ path: "author", select: "username" })
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" })
        }
        res.status(200).json(blog)

    } catch (error) {
        console.error("Error retrieving single blog", error)
        res.status(500).json({ message: "Error retrieving data from server" })
    }
}

// Delete single blog
exports.deleteBlog = async (req,res) => {
    try {
        const { slug } = req.params
        const userId = req.userId
        const isAdmin = req.userRole === "admin" // Allow admin to override delete blog
        
        // Find the blog
        const blog = await Blogs.findOne({ slug })
        if (!blog) return res.status(404).json({ message: "Blog not found" })
        // Check permission: only the author or an admin can delete
        if (blog.author.toString() !== userId && !isAdmin) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        // Delete the blog
        await Blogs.deleteOne({ slug })

        // Delete all comments associated with the blog
        await Comments.deleteMany({ blog: blog._id })

        res.json({ message: "Deleted successfully" })

    } catch (error) {
        console.error("Error deleting single data", error)
        res.status(500).json({ message: "Error deleting data" })
    }
}

// Update blog
exports.updateBlog = async (req,res) => {
    try {
        const { slug } = req.params
        const { title, content } = req.body
        const trimmedTitle = title.trim()
        const userId = req.userId

        if (trimmedTitle.length === 0) return res.status(400).json({ message: "Title cannot be blank." })
        if (trimmedTitle.length < 5) return res.status(400).json({ message: "Your title is too short." })
        if (trimmedTitle.length > 60) return res.status(400).json({ message: "Your title is too long." })
        if (content.replace(/<\/?[^>]+(>|$)/g, "").replace(/&nbsp;/gi, "").trim().length === 0) {
            return res.status(400).json({ message: "Content is entirely blank." })
        }

        const blog = await Blogs.findOneAndUpdate(
            { slug, author: userId }, 
            { title: trimmedTitle, content }, 
            { new: true })
            
        if (!blog) return res.status(404).json({ message: "Blog not found" })
        
        res.status(200).json({ blog, message: "Updated successfully" })
    
    } catch (error) {
        console.error("Error updating data", error)
        res.status(500).json({ message: "Error updating data" })
    }
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.