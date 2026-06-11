// routes/search.routes.js
import express from "express"
import { globalSearch } from "../controllers/search.controller.js"

const router = express.Router()

// روت جستجوی کلی: query پارامتر است که متن سرچ رو می‌گیره
router.get("/global-search", globalSearch)

export default router
