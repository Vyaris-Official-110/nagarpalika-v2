import Candidate from "../models/Candidate.js";

export const candidateAuth = async (req, res, next) => {
  if (!req.session?.candidate?.candidateId) {
    return res.status(401).json({
      isOk: false,
      status: 401,
      message: "Not logged in",
    });
  }

  const { candidateId, tenantId } = req.session.candidate;

  if (tenantId !== req.tenantId) {
    return res.status(403).json({
      isOk: false,
      status: 403,
      message: "Access denied",
    });
  }

  const candidate = await Candidate.findOne(
    { _id: candidateId, tenantId: req.tenantId },
    { passwordHash: 0, aadhaarHash: 0 }
  );

  if (!candidate || !candidate.isActive) {
    req.session.candidate = null;
    return res.status(401).json({
      isOk: false,
      status: 401,
      message: "Session invalid",
    });
  }

  req.candidate = candidate;
  next();
};
