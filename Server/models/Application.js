import mongoose from "mongoose";

const editLogEntrySchema = new mongoose.Schema(
  {
    editedAt: { type: Date, default: Date.now },
    changedFields: [{ type: String }],
  },
  { _id: false },
);

const applicationSchema = new mongoose.Schema(
  {
    applicationRefNo: { type: String, required: true, trim: true },
    registrationId: { type: String, required: true, trim: true, index: true },
    advtNo: { type: String, required: true, trim: true, index: true },
    submittedAt: { type: Date },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "fee_pending",
        "fee_paid",
        "shortlisted",
        "rejected",
      ],
      default: "draft",
    },
    editLog: [editLogEntrySchema],
    tenantId: { type: String, required: true, index: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

applicationSchema.index({ applicationRefNo: 1, tenantId: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
