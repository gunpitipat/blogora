const jwt = require("jsonwebtoken")

const attachUserId = (req, res, next) => {
    try {
        if (req.cookies.token) {
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET)
            req.userId = decoded.userId // Attach userId for username sync check in profile
        }
        next()
        
    } catch (error) {
        console.error("attachUserId error:", error)
        next()
    }
    // Do not attach userId if the viewer is not logged in or not the profile owner
}

module.exports = attachUserId

// © 2025 Pitipat Pattamawilai. All Rights Reserved.