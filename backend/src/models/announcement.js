import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    backgroundColor: {
        type: String,
        default: "#0f172a" // رنگ پس‌زمینه
    },
    textColor: {
        type: String,
        default: "#ffffff" // رنگ متن
    },
    link: {
        type: String,
        default: "" // لینک اختیاری
    }
}, { timestamps: true });

export default mongoose.model("Announcement", announcementSchema);