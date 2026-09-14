import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['student', 'recruiter', 'admin'],
        required: true,
    },
    isActive: { type: Boolean, default: true },

    // student only
    cgpa: { type: Number, min: 0, max: 10 },
    branch: { type: String },
    graduationYear: { type: Number },
    skills: [String],
    college: { type: String },
    resumeUrl: { type: String },

    // recruiter only
    companyName: { type: String },
    companyWebsite: { type: String },
    companyDescription: { type: String },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

// never leak the password hash through JSON responses
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

export default mongoose.model("User", userSchema);
