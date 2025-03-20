const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token // Extract token from cookies

    if (!token) return res.status(401).json({ message: "Access Denied" })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) // Return payload in token
        req.userId = decoded.userId // Attach userId to the request object for comment feature
        req.username = decoded.username
        req.userRole = decoded.role
        next()
    } catch (error) {
        res.status(403).json({ message: "Forbidden" })
    }
}

module.exports = authMiddleware

// © 2025 Pitipat Pattamawilai. All Rights Reserved.