import Candidate from "../models/Candidate.js";

const INACTIVITY_MS = 30 * 60 * 1000; // PRD §M7: 30-min inactivity timeout

export const candidateAuth = async (req, res, next) => {
  if (!req.session?.candidate?.candidateId) {
    return res
      .status(401)
      .json({ isOk: false, status: 401, message: "Not logged in" });
  }

  const { candidateId, tenantId, sessionToken, lastActivity } = req.session.candidate;

  if (lastActivity && Date.now() - lastActivity > INACTIVITY_MS) {
    req.session.candidate = null;
    return res
      .status(401)
      .json({ isOk: false, status: 401, message: "Session expired due to inactivity. Please log in again." });
  }

  if (tenantId !== req.tenantId) {
    return res
      .status(403)
      .json({ isOk: false, status: 403, message: "Access denied" });
  }

  const candidate = await Candidate.findOne(
    { _id: candidateId, tenantId: req.tenantId },
    { passwordHash: 0, aadhaarHash: 0 },
  );

  if (!candidate || !candidate.isActive) {
    req.session.candidate = null;
    return res
      .status(401)
      .json({ isOk: false, status: 401, message: "Session invalid" });
  }

  // Single-session enforcement — PRD §9.1
  if (
    candidate.activeSessionId &&
    sessionToken &&
    candidate.activeSessionId !== sessionToken
  ) {
    req.session.candidate = null;
    return res
      .status(401)
      .json({
        isOk: false,
        status: 401,
        message: "Session invalidated by new login",
      });
  }

  // Refresh lastActivity on every valid request
  req.session.candidate.lastActivity = Date.now();

  req.candidate = candidate;
  next();
};
