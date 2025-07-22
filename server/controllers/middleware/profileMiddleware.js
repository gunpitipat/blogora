const jwt = require("jsonwebtoken")

const profileMiddleware = (req, res, next) => {
    try {
        if (req.cookies.token) {
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET)
            req.userId = decoded.userId // Attach userId for username synchronization check in profile
        }
        next()
        
    } catch (error) {
        console.error("Error in profileMiddleware", error)
        next()
    }
    // Do not attach userId if the viewver is non-logged-in or not the same as the profile owner
}

module.exports = profileMiddleware

// © 2025 Pitipat Pattamawilai. All Rights Reserved.