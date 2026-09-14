import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft', index: true },
    requiredSkills: [String],
    applicationDeadline: { type: Date },
    eligibility: {
        minCGPA: { type: Number, default: 0 },
        allowedBranches: [String],
        graduationYear: { type: Number }
    },
    // optional listing details
    location: { type: String },
    jobType: { type: String, enum: ['full-time', 'internship', 'part-time', 'contract'], default: 'full-time' },
    salary: { type: String }
}, { timestamps: true })

export default mongoose.model("Job", jobSchema)
