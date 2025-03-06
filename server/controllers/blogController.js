// interact with database

const slugify = require("slugify")
const Blogs = require("../models/blogsModel")
const { v4: uuidv4 } = require('uuid');
const Comments = require("../models/commentsModel")

// create  data
exports.createBlog = async (req,res) => {
    const { title, content } = req.body
    const author = req.username // from token payload in authMiddleware

    // Generate a unique slug from title
    const generateUniqueSlug = async (title) => {
        let slug = slugify(title, { lower: true, strict: true }) || uuidv4() // if title contains only non-Latin characters
        let existingBlog = await Blogs.findOne({ slug })
        let identificationNumber = 1
        while (existingBlog) {
            slug = slugify(`${title}-${identificationNumber}`, { lower: true, strict: true })
            existingBlog = await Blogs.findOne({ slug }) // check again
            identificationNumber++
        }
        return slug
    }
    // validate data
    switch (true) {
        case title.trim().length === 0:
            return res.status(400).json({ message: "Please fill in your blog's title." })
        case title.trim().length >= 70:
            return res.status(400).json({ message: "Your title is too long." })
        case content.replace(/<\/?[^>]+(>|$)/g, "").trim().length === 0: // content มันเก็บเป็น tag html ถ้าใส่ค่าว่างมา มันจะมองเป็น <p>  </p>
            return res.status(400).json({ message: "Your content is entirely blank." })
    }

    const slug = await generateUniqueSlug(title);

    // create data
    Blogs.create({ title, content, author, slug })
    .then(blog => {
        res.status(201).json({ blog, message: "Your blog has been posted!" })
    })
    .catch(error => {
        console.error("Error creating blog", error)
        res.status(500).json({ message: "Internal server error. Please try again later." })
    })
} 

// get all data
exports.getAllBlogs = (req,res) => {
    Blogs.find({})
    .then(blogs => res.json(blogs))
    .catch(error => {
        console.error("Error retrieving all blogs", error)
        res.status(500).json({ message: "Error retrieving data from server" })
    })
}

// get single data
exports.getBlog = (req,res) => {
    const { slug } = req.params
    Blogs.findOne({ slug })
    .then(doc => {
        if (!doc) {
            return res.status(404).json({ message: "Blog not found" })
        }
        res.status(200).json(doc)
    })
    .catch(error => {
        console.error("Error retrieving single blog", error)
        res.status(500).json({ message: "Error retrieving data from server" })})
}

// delete single data
exports.deleteBlog = async (req,res) => {
    try {
        const { slug } = req.params
        const username = req.username
        
        // Delete the blog
        const deletedBlog = await Blogs.findOneAndDelete({ slug, author: username })
        if (!deletedBlog) return res.status(404).json({ message: "Blog not found" })
        
        // Delete all comments associated with the blog
        await Comments.deleteMany({ blog: deletedBlog._id })

        res.json({ message: "Deleted successfully" })
    } catch (error) {
        console.error("Error deleting single data", error)
        res.status(500).json({ message: "Error deleting data" })
    }
}

// update data
exports.updateBlog = (req,res) => {
    const { slug } = req.params
    const { title, content } = req.body
    const username = req.username
    if(title.trim().length === 0) return res.status(400).json({ message: "Title cannot be blank." })
    if(title.trim().length >= 70) return res.status(400).json({ message: "Your title is too long." })
    if(content.replace(/<\/?[^>]+(>|$)/g, "").trim().length === 0) return res.status(400).json({ message: "Content is entirely blank." })

    Blogs.findOneAndUpdate({ slug, author: username }, { title, content }, { new: true })
    .then(doc => res.status(200).json({ doc, message: "Updated successfully" }))
    .catch(error => {
        console.error("Error updating data", error)
        res.status(500).json({ message: "Error updating data" })
    })
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.