import dotenv from "dotenv"
dotenv.config()
import app from "./src/app.js"
import connectDB from "./src/db/connect.js"



const PORT = process.env.PORT || 5000

const startServer = async () => {
    try {
        await connectDB()
        console.log("✅ Connected to MongoDB")

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}/`)
        })
    } catch (err) {
        console.error("❌ Failed to start server:", err)
        process.exit(1)
    }
}

startServer()
