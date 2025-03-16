const jwt = require("jsonwebtoken")

const authStatusCheck = (req,res) => {
    const token = req.cookies.token

    if (!token) return res.status(401).json({ isAuthenticated: false })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        res.status(200).json({ isAuthenticated: true, username: decoded.username, role: decoded.role })
    } catch (error) {
        res.status(403).json({ isAuthenticated: false }) // Invalid or expired token
    }
}

module.exports = authStatusCheck

// © 2025 Pitipat Pattamawilai. All Rights Reserved.