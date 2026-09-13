import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
        type: String,
        enum: ['applied', 'shortlisted', 'interview', 'selected', 'rejected', 'withdrawn'],
        default: 'applied'
    },
    eligibilitySnapshot: {
        cgpa: Number,
        branch: String,
        graduationYear: Number
    }
}, { timestamps: true })

// compound unique index — student can't apply to same job twice
applicationSchema.index({ student: 1, job: 1 }, { unique: true })

export default mongoose.model("Application", applicationSchema)