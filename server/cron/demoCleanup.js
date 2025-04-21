const cron = require("node-cron")
const Users = require("../models/usersModel")
const Blogs = require("../models/blogsModel")

// Run every 10 mins
cron.schedule("*/10 * * * *", async () => {
    try {
        // List of active demo usernames
        const demoUsernames = await Users.find({ role: "demo" }).distinct("username")

        // Delete demo blogs whose author was auto-deleted by TTL
        const cleanupBlogs = await Blogs.deleteMany({
            isDemo: true,
            demoAuthor: {
                $nin: demoUsernames,
                $exists: true, // ensure it's not undefined
                $ne: "" // ensure it's not empty
            }
        })

        if (cleanupBlogs.deletedCount > 0) {
            console.log(`[Cron] ${new Date().toISOString()} - Deleted ${cleanupBlogs.deletedCount} orphaned demo blogs`)
        }
    } catch (error) {
        console.error("[Cron] Error cleaning up demo blogs", error)
    }
})

// © 2025 Pitipat Pattamawilai. All Rights Reserved.