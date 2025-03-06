// ชื่อบทความ (title), เนื้อหาบทความ (content), ผู้เขียน (author), slug (url)
// เวลาที่ทำการบันทึกหรืออัพเดทข้อมูล (timestamp)

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
        type: String,
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
    }]
}, { timestamps: true })

module.exports = mongoose.model("Blogs",blogSchema)

// © 2025 Pitipat Pattamawilai. All Rights Reserved.