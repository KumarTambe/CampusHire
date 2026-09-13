import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    changedByRole: { type: String, required: true },
    oldStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    reason: { type: String }
}, { timestamps: true })

export default mongoose.model("AuditLog", auditLogSchema)