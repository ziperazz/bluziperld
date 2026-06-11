import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "targetType",
        },

        targetType: {
            type: String,
            required: true,
            enum: ["Product", "Letter"],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        content: {
            type: String,
            required: true,
        },

        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: 5,
        },

        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
        },

        replies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        dislikes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        isBuyer: {
            type: Boolean,
            default: false,
        },

        // فیلد جدید وضعیت تایید ادمین
        approved: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);
export default Comment;
