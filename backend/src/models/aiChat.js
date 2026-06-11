import mongoose from "mongoose";

const AiChatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    messages: [{
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
    dailyRequestCount: {
        type: Number,
        default: 0,
    },
    lastRequestDate: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

AiChatSchema.index({ user: 1, lastRequestDate: 1 });

export default mongoose.model("AiChat", AiChatSchema);