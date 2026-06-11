import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productType: { type: String, required: true },
    title: { type: String },
    image: { type: String },
    price: { type: Number, required: true },
    priceAfterDiscount: { type: Number },
    quantity: { type: Number, required: true },
    writingType: { type: String, default: null },
    letterText: { type: String, default: null },
});

const OrderSchema = new mongoose.Schema(
    {
        trackingCode: { type: String, required: true, unique: true },
        
        // 🆕 کد رهگیری پست
        postTrackingCode: { type: String, default: null },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            default: null,
        },

        cart: [CartItemSchema],

        shipping: {
            fullName: String,
            phone: String,
            address: String,
            province: String,
            city: String,
            postalCode: String,
            shippingMethod: String,
            shippingPrice: Number,
            note: String,
        },

        subtotal: Number,
        shippingCost: Number,
        total: Number,

        status: {
            type: String,
            default: "AWAITING_ADMIN_REVIEW",
        },

        fakeOrderIdFromGateway: String,
    },
    { timestamps: true }
);

export default mongoose.model("order", OrderSchema);