import mongoose from "mongoose";

const siteConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, default: "" },
    tenantId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

siteConfigSchema.index({ key: 1, tenantId: 1 }, { unique: true });

export default mongoose.model("SiteConfig", siteConfigSchema);
