// controllers/search.controller.js
import Product from "../models/Product.js"
import Letter from "../models/Letter.js"

export const globalSearch = async (req, res) => {
    try {
        const { query } = req.query
        if (!query) return res.json({ products: [], letters: [] })

        const searchRegex = new RegExp(query, "i")

        const [products, letters] = await Promise.all([
            Product.find({
                $or: [{ title: searchRegex }, { description: searchRegex }],
            })
                .limit(5)
                .select("title price images"),

            Letter.find({
                $or: [{ title: searchRegex }, { category: searchRegex }],
            })
                .limit(5)
                .select("title slug images category")

        ])

        res.status(200).json({ products, letters })
    } catch (error) {
        res.status(500).json({ message: "خطا در جستجو", error })
    }
}
