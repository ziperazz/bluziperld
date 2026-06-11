const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },

    productType: {
        type: String,
        enum: ["product", "letter"],
        required: true,
    },

    quantity: {
        type: Number,
        default: 1,
    },

    letterText: String,

    writingType: {
        type: String,
        enum: ["HAND", "PRINT"],
    },

    basePrice: Number,
    writingPrice: Number,
    finalPrice: Number,
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    items: [cartItemSchema],
});

module.exports = mongoose.model("Cart", cartSchema);
