const cron = require("node-cron")
const Users = require("../models/usersModel")
const Blogs = require("../models/blogsModel")
const Comments = require("../models/commentsModel")
const mongoose = require("mongoose") 

// Run every 10 mins
cron.schedule("*/10 * * * *", async () => {
    try {
        // List of active demo usernames
        const demoUsernames = await Users.find({ role: "demo" }).distinct("username")

        // Delete demo blogs whose author was auto-deleted by TTL
        const deletedBlogs = await Blogs.deleteMany({
            isDemo: true,
            demoAuthor: {
                $nin: demoUsernames,
                $exists: true, // ensure it's not undefined
                $ne: "" // ensure it's not empty
            }
        })

        if (deletedBlogs.deletedCount > 0) {
            console.log(`[Cron] ${new Date().toISOString()} - Deleted ${deletedBlogs.deletedCount} orphaned demo blogs`)
        } else {
            console.log(`[Cron] ${new Date().toISOString()} - No orphaned demo blogs found`)
        }

        // Find orphaned demo comments
        const orphanedComments = await Comments.find({ 
            isDemo: true, 
            demoAuthor: {
                $nin: demoUsernames,
                $exists: true,
                $ne: ""
            }
        }).select("_id blog")

        const orphanedCommentIds = orphanedComments.map(comment => comment._id)

        // Group comment IDs per blog
        const blogUpdatesMap = new Map()                                                                                              
        orphanedComments.forEach(comment => {              
            const blogId = comment.blog.toString()   
            if (!blogUpdatesMap.has(blogId)) {              //  {
                blogUpdatesMap.set(blogId, [])              //    "blogId1": [commentId1, commentId2],
            }                                               //    "blogId2": [commentId3], ...
            blogUpdatesMap.get(blogId).push(comment._id)    //  }    
        })

        const blogIds = Array.from(blogUpdatesMap.keys()).map(blogId => new mongoose.Types.ObjectId(blogId)) // Map back to ObjectId for query

        // Get only normal blogs
        const normalBlogs = await Blogs.find({               
            _id: { $in: blogIds },
            isDemo: false        
        }).select("_id").lean() // Read only

        // Remove orphaned ref comment IDs from normal blogs
        for (const blog of normalBlogs) {
            const commentIds = blogUpdatesMap.get(blog._id.toString()) // Map keys are stored as Strings
            await Blogs.findByIdAndUpdate(blog._id, {
                $pull: { comments: { $in: commentIds } }
            })
        }

        // Delete orphaned demo commments
        const deletedComments = await Comments.deleteMany({ _id: { $in: orphanedCommentIds } })

        if (deletedComments.deletedCount > 0) {
            console.log(`[Cron] ${new Date().toISOString()} - Deleted ${deletedComments.deletedCount} orphaned demo comments`)
        } else {
            console.log(`[Cron] ${new Date().toISOString()} - No orphaned demo comments found`)
        }
    } catch (error) {
        console.error("[Cron] Error cleaning up demo", error)
    }
})

// © 2025 Pitipat Pattamawilai. All Rights Reserved.