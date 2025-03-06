// comments and replies (nested comments)
    // key fields
        // user => The user who made the comment
        // blog => The blog post the comment belongs to
        // content => The comment text
        // parentComment => If null, it’s a top-level comment. If it contains an ObjectId, it’s a reply to another comment.

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
    isDeleted: { // for softly deleting comment
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("Comments", commentSchema)

// © 2025 Pitipat Pattamawilai. All Rights Reserved.