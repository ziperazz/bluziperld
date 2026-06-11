import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    authority: {
        type: String,
        required: true,
        unique: true
    },

    orderId: {
        type: String,
        required: false,
        default: null
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },

    refId: String,

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }

}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);