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
        unique: true, // User freely sets their username with capital letters but prevent case-sensitive duplicates at the same time
        lowercase: true
    },
    password: { // unique: false
        type: String,
        required: true,
        index: false // Ensure no index is created on password
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Ensures the value can only be either one of the predefined options
        default: 'user'
    }
})

module.exports = mongoose.model("Users",userSchema)

// © 2025 Pitipat Pattamawilai. All Rights Reserved.