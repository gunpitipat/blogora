const jwt = require("jsonwebtoken")

const demoContentFilter = (withSlug = false) => {
    return (req, res, next) => {
        const { slug } = req.params
        let filter = withSlug 
            ? { isDemo: false, slug }
            : { isDemo: false } // Exclude demo content by default

        const token = req.cookies.token
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET)

                if (decoded.role === "demo") {
                    // Allow normal content + their own demo items
                    filter = {
                        $or: [
                            { isDemo: false, ...(withSlug && { slug }) },
                            { isDemo: true, demoAuthor: decoded.username, ...(withSlug && { slug }) }
                        ]
                    }
                }

            } catch (error) {
                // Invalid or expired token - fallback to default filter
            }
        }

        req.demoFilter = filter
        next()
    }
}

module.exports = demoContentFilter

// © 2025 Pitipat Pattamawilai. All Rights Reserved.