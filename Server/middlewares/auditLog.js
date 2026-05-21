import AuditLog from "../models/AuditLog.js";

/**
 * Fire-and-forget audit log write — PRD §9.12
 * Never throws; audit failure must not block the main response.
 */
export function logAudit(req, action, resourceType = "", resourceId = "", metadata = {}) {
  const sessionUser = req.session?.user ?? {};
  const entry = {
    action,
    adminId:      sessionUser.id ?? null,
    adminEmail:   sessionUser.email ?? "",
    tenantId:     req.tenantId ?? "unknown",
    resourceType,
    resourceId:   String(resourceId),
    ip:           (req.ip ?? "").replace("::ffff:", ""),
    metadata,
    timestamp:    new Date(),
  };
  AuditLog.create(entry).catch((err) =>
    console.error("auditLog.js: write failed", err?.message),
  );
}
