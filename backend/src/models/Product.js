import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Product title is required"],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            index: true,
        },

        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0, "Price cannot be negative"],
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        images: {
            type: [String],
            default: [],
        },

        specs: {
            type: [
                {
                    label: { type: String, default: "" },
                    value: { type: String, default: "" },
                },
            ],
            default: [],
        },

        category: {
            type: String,
            default: "general",
            trim: true,
        },

        instock: {
            type: Number,
            default: 0,
            min: 0,
        },

        purchaseCount: {
            type: Number,
            default: 0,
        },

        ratingAverage: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        visits: {
            type: Number,
            default: 0,
            min: 0,
        },

        // 🆕 SEO Meta Tags
        metaTags: {
            type: {
                title: { type: String, default: "" },
                description: { type: String, default: "" },
                keywords: { type: [String], default: [] }
            },
            default: { title: "", description: "", keywords: [] }
        },
    },
    { timestamps: true }
);

const Product =
    mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;