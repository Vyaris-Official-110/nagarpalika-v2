import { Router } from "express";
import {
  listCandidates,
  getCandidateById,
  toggleCandidateStatus,
} from "../../controllers/v1/candidate.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post(
  "/candidates/search",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
  listCandidates,
);

router.get(
  "/candidates/:id",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
  getCandidateById,
);

router.patch(
  "/candidates/:id/status",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  toggleCandidateStatus,
);

export default router;
