const jwt = require("jsonwebtoken")

const authenticateUser = (req, res, next) => {
    const token = req.cookies.token // Extract token from cookies

    if (!token) return res.status(401).json({ message: "Access Denied" })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) // return payload in token
        req.userId = decoded.userId // Attach userId to the request object
        req.username = decoded.username
        next()
    } catch (error) {
        res.status(403).json({ message: "Forbidden" }) // 
    }
}

module.exports = authenticateUser

// this authMiddleware always attach userId to the request. It was designed to comment feature which requires userId
// other protected routes which just need only token verification can use this authMiddleware because attaching it doesn't cause any harm
// attaching userId to req in all protected routes is not necessarily bad

// © 2025 Pitipat Pattamawilai. All Rights Reserved.