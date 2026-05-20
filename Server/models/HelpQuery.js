import mongoose from "mongoose";

const helpQuerySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    registrationId: { type: String, trim: true, default: "" },
    queryCategory: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: "" },
    mobile: { type: String, trim: true, default: "" },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "replied", "closed"],
      default: "open",
    },
    tenantId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

helpQuerySchema.index({ tenantId: 1, status: 1, createdAt: -1 });

export default mongoose.model("HelpQuery", helpQuerySchema);
