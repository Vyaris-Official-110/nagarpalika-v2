import mongoose from "mongoose";

const callLetterSchema = new mongoose.Schema(
  {
    registrationId: { type: String, required: true, trim: true, index: true },
    advtNo: { type: String, required: true, trim: true, index: true },
    rollNumber: { type: String, trim: true, default: "" },
    examDate: { type: Date },
    venue: { type: String, trim: true, default: "" },
    enabled: { type: Boolean, default: false },
    availableFrom: { type: Date },
    tenantId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

callLetterSchema.index(
  { registrationId: 1, advtNo: 1, tenantId: 1 },
  { unique: true },
);

export default mongoose.model("CallLetter", callLetterSchema);
