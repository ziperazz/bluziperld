import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
    {
        message: {
            type: String,
            required: true,
            trim: true,
        },

        type: {
            type: String,
            enum: ["system", "user", "order", "admin"],
            default: "system",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model("Activity", activitySchema);
