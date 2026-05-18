const KNOWN_TENANTS = new Set(
  (process.env.KNOWN_TENANTS || "patan,palanpur")
    .split(",")
    .map((t) => t.trim().toLowerCase()),
);

const DEFAULT_TENANT = process.env.DEFAULT_TENANT_ID || "patan";

export const tenantMiddleware = (req, res, next) => {
  // Dev override: x-tenant-id header or ?tenantId= query param
  if (process.env.NODE_ENV !== "production") {
    const override = req.headers["x-tenant-id"] || req.query.tenantId;
    if (override) {
      req.tenantId = override.toLowerCase().trim();
      return next();
    }
  }

  // Extract subdomain: patan.nagarpalika.gov.in → "patan"
  const parts = req.hostname.split(".");
  const subdomain = parts.length >= 3 ? parts[0].toLowerCase() : null;

  if (subdomain && KNOWN_TENANTS.has(subdomain)) {
    req.tenantId = subdomain;
  } else {
    req.tenantId = DEFAULT_TENANT;
  }

  next();
};
