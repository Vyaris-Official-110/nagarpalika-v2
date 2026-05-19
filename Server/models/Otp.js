import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    type: {
      type: String,
      enum: ["email_verify", "aadhaar_otp", "login_otp"],
      default: "email_verify",
    },
    otp: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // 5 minutes
    },
  },
  {
    timestamps: true,
  },
);

const Otp = mongoose.model("Otp", OtpSchema);

export default Otp;
