import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    registrationId: { type: String, required: true, trim: true },
    aadhaarHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["M", "F", "O"], required: true },
    category: { type: String, trim: true, default: "GEN" },
    address: { type: String, trim: true, default: "" },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    photoPath: { type: String, default: "" },
    signaturePath: { type: String, default: "" },
    languages: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    tenantId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

candidateSchema.index({ registrationId: 1, tenantId: 1 }, { unique: true });
candidateSchema.index({ mobile: 1, tenantId: 1 });

export default mongoose.model("Candidate", candidateSchema);
