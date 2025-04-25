const jwt = require("jsonwebtoken")

const allBlogFilterMiddleware = (req, res, next) => {
    let filter = { isDemo: false } // Exclude demo blogs by default

    const token = req.cookies.token
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            if (decoded.role === "demo") {
                // Allow normal blogs + their own demo blogs
                filter = {
                    $or: [
                        { isDemo: false },
                        { isDemo: true, demoAuthor: decoded.username }
                    ]
                }
            }
        } catch (error) {
            // Invalid or expired token - fallback to default filter
        }
    }

    req.blogFilter = filter
    next()
}

module.exports = allBlogFilterMiddleware

// © 2025 Pitipat Pattamawilai. All Rights Reserved.