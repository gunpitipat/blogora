// Comments and replies (nested comments)
    // Key fields
        // user => The user who made the comment
        // blog => The blog post the comment belongs to
        // content => The comment text
        // parentComment => If null, it’s a top-level comment. If it contains an ObjectId, it’s a reply to another comment

const mongoose = require("mongoose")

const commentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users", // Reference to Users model (collection)
        required: true
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blogs", // Reference to the blog post where the comment belongs to
        required: true
    },
    content: {
        type: String,
        required: true
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments", // Reference to another Comment for replies
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isDeleted: { // Soft delete flag, used for conditional rendering on the frontend
        type: Boolean,
        default: false
    },
    isDemo: {
        type: Boolean,
        default: false
    },
    demoAuthor: {
        type: String
    }
})

// Compound index (improve queries efficiency on demo comments)
commentSchema.index({ isDemo: 1, demoAuthor: 1 })

module.exports = mongoose.model("Comments", commentSchema)

// © 2025 Pitipat Pattamawilai. All Rights Reserved.