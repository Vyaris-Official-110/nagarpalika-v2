import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        "notice",
        "circular",
        "tender",
        "press",
        "recruitment",
        "result",
        "important_instruction",
      ],
      required: true,
    },
    body: { type: String, default: "" }, // rich text body — PRD §5.8.3
    refNo: { type: String, trim: true, default: "" },
    publishedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    pdfPath: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    tenantId: { type: String, required: true, index: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

noticeSchema.index({ tenantId: 1, status: 1, publishedAt: -1 });

export default mongoose.model("Notice", noticeSchema);
