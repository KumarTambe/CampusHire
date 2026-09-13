import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
    requiredSkills: [String],
    applicationDeadline: { type: Date },
    eligibility: {
        minCGPA: { type: Number, default: 0 },
        allowedBranches: [String],
        graduationYear: { type: Number }
    }
}, { timestamps: true })

export default mongoose.model("Job", jobSchema)