const Comments = require("../models/commentsModel")
const Blogs = require("../models/blogsModel")

// Create a new comment and link it to a blog
exports.createComment = async (req,res) => {
    try {
        const userId = req.userId // Extracted from JWT token (authMiddleware)
        const { slug } = req.params
        const { content, parentCommentId } = req.body

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: "Comment content cannot be empty." })
        }
    
        const blog = await Blogs.findOne({ slug })
        if (!blog) return res.status(404).json({ message: "Blog not found" })
        
        // If parentCommentId is provided, ensure parent comment actually exists
        if (parentCommentId) {
            const parentComment = await Comments.findById(parentCommentId)
            if (!parentComment) return res.status(404).json({ message: "Parent comment not found" })
            // and ensure parent comment belongs to the same blog (In Mongoose, we cannot compare ObjectId values directly using !== or !=, so use toSting() to compare)
            if (parentComment.blog.toString() !== blog._id.toString()) {
                return res.status(400).json({ message: "Parent comment does not belong to this blog." })
            }
        }

        const comment = new Comments({
            user: userId,
            blog: blog._id,
            content: content.trim(),
            parentComment: parentCommentId || null // if req.body doesn't contain parentCommentId, set it null (top-level comment)
        })
        await comment.save()
        await Blogs.findByIdAndUpdate(blog._id, { $push: { comments: comment._id } })
        
        res.status(201).json({ message: "Comment has been post.", comment })
    } catch (error) {
        console.error("Error creating comment:", error)
        res.status(500).json({ error })
    }
}

// Retrieve comments for a blog
exports.getComments = async (req,res) => {
    try {
        const { slug } = req.params

        const blog = await Blogs.findOne({ slug }).select("_id")
        if (!blog) return res.status(404).json({ message: "Blog not found" })

        const comments = await Comments.find({ blog: blog._id })
        .populate({ path: "user", select: "username" }) // Populate user details
        .sort({ createdAt: 1 }) // Sort by oldest comment first

        res.status(200).json(comments)
        
    } catch (error) {
        console.error("Error retrieving comments:", error)
        res.status(500).json({ message: "Error retreiving comments", error })
    }
}

// Delete comment with conditional soft/hard deletion 
        // if the comment has replies, soft delete by replacing its content with a placeholder message.
        // if the comment has no replies, hard delete by removing both comment document from comments collection and referenced comment id from blog's comments array.
            // if the lowest comment is deleted, while its parent comment was earlier deleted by soft deletion then now it has no more replies. Automatically hard delete it.
exports.deleteComment = async (req,res) => {
    try {
        const { commentId } = req.params
        const userId = req.userId
        
        // Find the comment
        const comment = await Comments.findById(commentId)
        if (!comment) return res.status(404).json({ message: "Comment not found" })

        if (userId !== comment.user.toString()) return res.status(401).json({ message: "Unauthorized" })
        
        // Check if the comment has replies
        const hasReplies = await Comments.exists({ parentComment: commentId }) // Comments.exists checks whether at least one document matching the given condition exists in the database and returns document's id (truthy value) or null (falsy value)
        
        if (hasReplies) {
            // Soft delete
            await Comments.findByIdAndUpdate(commentId, {
                content: "This comment has been deleted.",
                isDeleted: true
            })
            return res.json({ message: "Comment has been deleted." })
        } else {
            // Hard delete
            const deletedComment = await Comments.findByIdAndDelete(commentId)
            if (deletedComment) { // Ensure findByIdAndDelete was successful and avoid unnecessary blog update
                await Blogs.updateOne({ _id: comment.blog }, { $pull: { comments: commentId } })

                // Check if its parent comment should be deleted
                // Recursively hard delete soft-deleted parents that no longer have replies
                let parentId = deletedComment.parentComment
                while (parentId) {
                    const parent = await Comments.findById(parentId)
                    if (!parent || !parent.isDeleted) break // stop if parent doesn't exist or isn't soft deleted

                    const stillHasReplies = await Comments.exists({ parentComment: parent._id })

                    if (!stillHasReplies) {
                        await Comments.findByIdAndDelete(parent._id)
                        await Blogs.updateOne({ _id: comment.blog }, { $pull: { comments: parent._id } })
                        parentId = parent.parentComment // Move up to the next ancestor
                    } else {
                        break // stop if parent still has replies
                    }
                }
            }
            return res.json({ message: "Comment has been deleted." })
        }

    } catch (error) {
        console.error("Error deleting comment:", error)
        res.status(500).json({ message: "Error deleteing comment", error })
    }
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.