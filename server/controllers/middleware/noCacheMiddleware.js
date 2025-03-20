const noCacheMiddleware = (req, res, next) => {
    // Force browsers not to cache auth responses to prevent it from storing old auth data (stale state)
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
        res.setHeader("Pragma", "no-cache") // For older HTTP/1.0 clients
        res.setHeader("Expires", "0") // Just for older browsers
        next()
}

module.exports = noCacheMiddleware

// © 2025 Pitipat Pattamawilai. All Rights Reserved.