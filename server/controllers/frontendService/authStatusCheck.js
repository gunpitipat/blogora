const jwt = require("jsonwebtoken")

const authStatusCheck = (req,res) => {
    const token = req.cookies.token

    if (!token) return res.status(401).json({ isAuthenticated: false })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        res.status(200).json({ isAuthenticated: true, username: decoded.username })
    } catch (error) {
        res.status(403).json({ isAuthenticated: false }) // Invalid or expired token
    }
}
// Frontend only needs isAuthenticated as a boolean, then actually respond only JSON is enough. No need status code if frontend doesn't handle errors.

module.exports = authStatusCheck