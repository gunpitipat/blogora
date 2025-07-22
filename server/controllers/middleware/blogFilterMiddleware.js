const jwt = require("jsonwebtoken")

const blogFilterMiddleware = (req, res, next) => {
    const { slug } = req.params
    let filter = { isDemo: false, slug } // Default filter

    const token = req.cookies.token
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            if (decoded.role === "demo") {
                // Allow demo user to access their own blog
                filter = {
                    $or: [
                        { isDemo: false, slug },
                        { isDemo: true, demoAuthor: decoded.username, slug }
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

module.exports = blogFilterMiddleware

// © 2025 Pitipat Pattamawilai. All Rights Reserved.