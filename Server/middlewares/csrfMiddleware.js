import crypto from "crypto";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_COOKIE = "csrf-token";
const CSRF_HEADER = "x-csrf-token";

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Double-submit cookie CSRF protection (PRD §9.7).
 * Safe methods: issue a csrf-token cookie if absent.
 * State-changing methods: cookie value must match X-CSRF-Token header.
 * Public auth endpoints are excluded (called before cookie is available).
 */
export const csrfMiddleware = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    if (!req.cookies?.[CSRF_COOKIE]) {
      const token = generateToken();
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false, // JS must read it to include in header
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      });
    }
    return next();
  }

  const path = req.path;
  const excluded = [
    "/api-docs",
    "/api",
    "/api/v1/otr/aadhaar/",
    "/api/v1/otr/login",
    "/api/v1/otr/find",
    "/api/v1/auth/employee/login",
    "/api/v1/auth/company/login",
  ];

  if (excluded.some((e) => path.startsWith(e))) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      isOk: false,
      status: 403,
      message: "CSRF token mismatch",
    });
  }

  next();
};
