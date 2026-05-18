import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema(
  {
    advtNo: { type: String, required: true, trim: true },
    postTitle: { type: String, required: true, trim: true },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    postClass: { type: String, trim: true, default: "" },
    payScale: { type: String, trim: true, default: "" },
    vacancies: { type: Number, required: true, min: 1 },
    applicationFee: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    pdfPath: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
    },
    tenantId: { type: String, required: true, index: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

advertisementSchema.index({ advtNo: 1, tenantId: 1 }, { unique: true });

export default mongoose.model("Advertisement", advertisementSchema);
