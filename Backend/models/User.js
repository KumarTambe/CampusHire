import mongoose from "mongoose";

const Users = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['student', 'recruiter', 'admin'],
        required: true,
    },
    isActive: { type: Boolean, default: true },

    // student only
    cgpa: { type: Number },
    branch: { type: String },
    graduationYear: { type: Number },
    skills: [String],
    college: { type: String },

    //recruiter only
    companyName: { type: String },
    companyWebsite: { type: String },
    companyDescription: { type: String },
    verificationStatus: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected'],
        default: 'Pending'
    }
});

export default mongoose.model("User", Users);  