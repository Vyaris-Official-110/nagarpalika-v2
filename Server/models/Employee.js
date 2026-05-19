import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoleMaster",
      required: true,
    },
    emailOffice: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: false,
      trim: true,
    },
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // 2FA — PRD §9.1, §5.8.1
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: "" }, // TOTP base32 secret
    loginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date },

    // IP whitelist — PRD §5.8.1, §9.1 (empty = no restriction)
    ipWhitelist: { type: [String], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("Employee", EmployeeSchema);
