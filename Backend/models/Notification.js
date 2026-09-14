import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
