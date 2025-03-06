const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const mongoose = require("mongoose")
require("dotenv").config()
const blogRoutes  = require("./routes/blogRoutes")
const userRoutes = require("./routes/userRoutes")
const commentRoutes = require("./routes/commentRoutes")
const cookieParser = require("cookie-parser")

const app = express()

// connecting to cloud database
mongoose.connect(process.env.DATABASE,{
    // useNewUrlParser:true,
    // useUnifiedTopology:false
}).then(() => console.log("database connected"))
.catch((err) => console.error(err))

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_DOMAIN, // Allow frontend domain
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json()) // Parser JSON requests (ให้ server บริการ REST API (respond json))
app.use(cookieParser()) // Enable cookie parsing
app.use(morgan("dev"))

// Routes
app.use("/api", blogRoutes)
app.use("/api", userRoutes)
app.use("/api", commentRoutes)

// Handle undefined routes (404)
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack) // Log the error
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    })
})

const port = process.env.PORT || 8080 // ให้ port มีค่าตาม PORT ที่ตั้งค่าในไฟล์ .env แต่หากไม่ได้นิยาม PORT ใน .env ก็ให้มีค่า 8080 ในตอนเริ่มต้น
app.listen(port,() => console.log(`Server listening on port ${port}`))

// © 2025 Pitipat Pattamawilai. All Rights Reserved.