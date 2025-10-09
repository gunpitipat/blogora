const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const cookieParser = require("cookie-parser")

const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const blogRoutes  = require("./routes/blogRoutes")
const commentRoutes = require("./routes/commentRoutes")

const app = express()

const allowedOrigins = [process.env.FRONTEND_DOMAIN, "http://localhost:3000"]

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json()) // Parse incoming JSON requests into req.body
app.use(cookieParser()) // Enable cookie parsing
app.use(morgan("dev"))

app.use("/api", authRoutes)
app.use("/api", userRoutes)
app.use("/api", blogRoutes)
app.use("/api", commentRoutes)

// Health check route (used to wake up the server on free hosting plans)
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

// Handle undefined routes (404)
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" })
})

module.exports = app

// © 2025 Pitipat Pattamawilai. All Rights Reserved.