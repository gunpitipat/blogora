// email, username, password

const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
    },
    username_lowercase: {
        type: String,
        required: true,
        unique: true, // users freely set their usernames with capital letters but prevent case-sensitive duplicates at the same time
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        // unique: true
        index: false // Ensure no index is created on password
    }
})

module.exports = mongoose.model("Users",userSchema)

// © 2025 Pitipat Pattamawilai. All Rights Reserved.