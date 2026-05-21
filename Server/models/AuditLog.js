import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action:       { type: String, required: true, trim: true },
    adminId:      { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    adminEmail:   { type: String, trim: true, default: "" },
    tenantId:     { type: String, required: true, index: true },
    resourceType: { type: String, trim: true, default: "" },
    resourceId:   { type: String, trim: true, default: "" },
    ip:           { type: String, trim: true, default: "" },
    metadata:     { type: mongoose.Schema.Types.Mixed },
    timestamp:    { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);

auditLogSchema.index({ tenantId: 1, timestamp: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
