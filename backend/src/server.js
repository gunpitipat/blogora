require("dotenv").config()
const mongoose = require("mongoose")
require("./jobs/demoCleanup")
const app = require("./app")

mongoose.connect(process.env.DATABASE)
    .then(() => console.log("Database connected"))
    .catch((err) => console.error(err))

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Server running on port ${port}`))

// © 2025 Pitipat Pattamawilai. All Rights Reserved.