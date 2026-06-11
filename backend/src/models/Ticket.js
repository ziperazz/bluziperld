import mongoose from "mongoose";

const ticketAttachmentSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            enum: ["image", "file"],
            default: "file",
        },
    },
    { _id: false }
);

const ticketMessageSchema = new mongoose.Schema(
    {
        sender: {
            type: String,
            enum: ["user", "admin"],
            required: true,
        },
        message: {
            type: String,
            trim: true,
            required: true,
        },
        attachments: {
            type: [ticketAttachmentSchema],
            default: [],
        },
    },
    { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        subject: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["OPEN", "WAITING_ADMIN", "WAITING_USER", "CLOSED"],
            default: "OPEN",
            index: true,
        },

        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
            default: "MEDIUM",
            index: true,
        },

        messages: {
            type: [ticketMessageSchema],
            default: [],
        },
    },
    { timestamps: true }
);

export default mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
