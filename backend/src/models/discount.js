import mongoose from "mongoose";

const DiscountSchema = new mongoose.Schema(
    {
        code: { 
            type: String, 
            required: true, 
            unique: true,
            uppercase: true 
        },
        type: { 
            type: String, 
            enum: ["percent", "fixed"], 
            required: true 
        },
        value: { 
            type: Number, 
            required: true 
        },
        minOrderAmount: { 
            type: Number, 
            default: 0 
        },
        maxUses: { 
            type: Number, 
            default: 0  // 0 = نامحدود
        },
        usedCount: { 
            type: Number, 
            default: 0 
        },
        expiresAt: { 
            type: Date, 
            default: null 
        },
        isActive: { 
            type: Boolean, 
            default: true 
        },
        description: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

export default mongoose.model("Discount", DiscountSchema);