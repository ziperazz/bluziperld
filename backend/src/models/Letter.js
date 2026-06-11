import mongoose from "mongoose";

const letterSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Letter title is required"],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            index: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        category: {
            type: String,
            required: [true, "Letter category is required"],
            trim: true,
            index: true,
        },

        price: {
            type: Number,
            required: [true, "Letter price is required"],
            min: [0, "Price cannot be negative"],
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        instock: {
            type: Number,
            default: 0,
            min: 0,
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

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        printingExtraPrice: {
            type: Number,
            default: 0,
            min: 0,
        },

        handwritingExtraPrice: {
            type: Number,
            default: 0,
            min: 0,
        },

        visits: {
            type: Number,
            default: 0,
            min: 0,
        },

        purchaseCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        ratingAverage: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        rating: {
            type: [Number],
            default: [],
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

/* محاسبه قیمت بعد از تخفیف */
letterSchema.virtual("priceAfterDiscount").get(function () {
    if (!this.discount) return this.price;
    return Math.round(this.price - (this.price * this.discount) / 100);
});

/* نمایش virtual ها در JSON */
letterSchema.set("toJSON", { virtuals: true });
letterSchema.set("toObject", { virtuals: true });

const Letter =
    mongoose.models.Letter || mongoose.model("Letter", letterSchema);

export default Letter;