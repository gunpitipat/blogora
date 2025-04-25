const jwt = require("jsonwebtoken")

const commentFilterMiddleware = (req, res, next) => {
    let commentFilter = { isDemo: false } // Exclude demo comments by default

    const token = req.cookies.token
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            if (decoded.role === "demo") {
                // Allow normal comments + their own demo comments
                commentFilter = {
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

    req.commentFilter = commentFilter
    next()
}

module.exports = commentFilterMiddleware

// © 2025 Pitipat Pattamawilai. All Rights Reserved.