const mongoose = require("mongoose")

const blogSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users", // Reference to Users model
        required: true
    },
    slug: {
        type: String,
        lowercase: true,
        unique: true
    },
    comments: [{ // Referenced documents: an array of ObjectIds
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments" // Reference to the Comment model
    }],
    isDemo: {
        type: Boolean,
        default: false
    },
    demoAuthor: {
        type: String
    }
}, { timestamps: true })

// Compound index (make cron job and queries on demo blogs faster and efficient)
blogSchema.index({ isDemo: 1, demoAuthor: 1 })

module.exports = mongoose.model("Blogs",blogSchema)

// © 2025 Pitipat Pattamawilai. All Rights Reserved.