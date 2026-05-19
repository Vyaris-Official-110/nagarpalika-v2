import EmployeeModels from "../models/Employee.js";

const ADMIN_INACTIVITY_MS = 15 * 60 * 1000; // 15 min — PRD §9.1

/**
 * Authentication Middleware — PRD §9.1, §5.8.1
 * Enforces session validity, role check, IP whitelist, 15-min admin inactivity timeout.
 */
export const authMiddleware = (roles) => {
  return async (req, res, next) => {
    if (!req.session?.user) {
      res.clearCookie("sessionId");
      return res
        .status(401)
        .json({ success: false, status: 401, message: "Not logged in" });
    }

    const sessionUser = req.session.user;

    // Admin 15-min inactivity timeout — PRD §9.1
    const now = Date.now();
    if (
      req.session.adminLastActivity &&
      now - req.session.adminLastActivity > ADMIN_INACTIVITY_MS
    ) {
      req.session.destroy(() => {});
      res.clearCookie("sessionId");
      return res
        .status(401)
        .json({
          success: false,
          status: 401,
          message: "Admin session expired due to inactivity",
        });
    }
    req.session.adminLastActivity = now;

    if (!sessionUser.id || !sessionUser.role) {
      res.clearCookie("sessionId");
      return res.status(401).json({
        success: false,
        status: 401,
        message: "Session invalid or expired",
      });
    }

    if (roles && roles.length > 0 && !roles.includes(sessionUser.role)) {
      return res
        .status(403)
        .json({ success: false, status: 403, message: "Access denied" });
    }

    // IP whitelist enforcement — PRD §5.8.1, §9.1
    const employee = await EmployeeModels.findById(sessionUser.id)
      .select("ipWhitelist")
      .lean();
    if (employee?.ipWhitelist?.length > 0) {
      const clientIp = (req.ip || req.connection?.remoteAddress || "").replace(
        "::ffff:",
        "",
      );
      if (!employee.ipWhitelist.includes(clientIp)) {
        return res
          .status(403)
          .json({ success: false, status: 403, message: "Access denied" });
      }
    }

    req.user = {
      id: sessionUser.id,
      role: sessionUser.role,
      email: sessionUser.email,
      name: sessionUser.name,
      departmentId: sessionUser.departmentId,
    };

    next();
  };
};
