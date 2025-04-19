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
        enum: ["user", "admin", "demo"], // Ensures the value can only be either one of the predefined options
        default: "user"
    },
    expiresAt: {
        type: Date,
        required: false,
        default: undefined // Only set for demo users
    }
})

// TTL index to auto-delete demo users (docs with expiresAt) when expiresAt is reached
userSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model("Users",userSchema)

// © 2025 Pitipat Pattamawilai. All Rights Reserved.