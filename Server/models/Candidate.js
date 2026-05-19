import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, trim: true, default: "" },
    line2: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    district: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "Gujarat" },
    pincode: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const qualificationSchema = new mongoose.Schema(
  {
    degree: { type: String, trim: true, default: "" },
    subject: { type: String, trim: true, default: "" },
    university: { type: String, trim: true, default: "" },
    passYear: { type: String, trim: true, default: "" },
    percentage: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const languageSchema = new mongoose.Schema(
  {
    language: { type: String, trim: true },
    canRead: { type: Boolean, default: false },
    canWrite: { type: Boolean, default: false },
    canSpeak: { type: Boolean, default: false },
  },
  { _id: false },
);

const candidateSchema = new mongoose.Schema(
  {
    registrationId: { type: String, required: true, trim: true },
    aadhaarHash: { type: String, required: true },

    // Personal info
    name: { type: String, trim: true, default: "" },
    fatherName: { type: String, trim: true, default: "" },
    dob: { type: Date },
    gender: { type: String, enum: ["M", "F", "O"], default: "M" },
    category: { type: String, trim: true, default: "GEN" },
    nationality: { type: String, trim: true, default: "Indian" },
    religion: { type: String, trim: true, default: "" },
    maritalStatus: { type: String, enum: ["S", "M", "W", "D"], default: "S" },
    motherTongue: { type: String, trim: true, default: "" },
    exServiceman: { type: Boolean, default: false },

    // Physical disability
    phStatus: { type: Boolean, default: false },
    phType: { type: String, trim: true, default: "" },
    phPercentage: { type: Number, default: 0 },

    // Contact
    mobile: { type: String, required: true, trim: true },
    altMobile: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },

    // Address
    permanentAddress: { type: addressSchema, default: () => ({}) },
    currentAddress: { type: addressSchema, default: () => ({}) },
    currentSameAsPermanent: { type: Boolean, default: false },

    // Education
    qualification: { type: qualificationSchema, default: () => ({}) },

    // Language proficiency
    languages: { type: [languageSchema], default: [] },

    // Documents
    photoPath: { type: String, default: "" },
    signaturePath: { type: String, default: "" },

    // Auth
    passwordHash: { type: String, default: "" },
    loginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date },

    // OTR workflow
    otrStep: { type: Number, default: 1, min: 1, max: 10 },
    registrationCompleted: { type: Boolean, default: false },
    editWindowExpiresAt: { type: Date },

    isActive: { type: Boolean, default: true },
    tenantId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

candidateSchema.index({ registrationId: 1, tenantId: 1 }, { unique: true });
candidateSchema.index({ aadhaarHash: 1, tenantId: 1 }, { unique: true });
candidateSchema.index({ mobile: 1, tenantId: 1 });

export default mongoose.model("Candidate", candidateSchema);
