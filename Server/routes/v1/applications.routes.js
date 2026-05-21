import { Router } from "express";
import {
  listApplications,
  getApplicationById,
  updateApplicationStatus,
  exportApplications,
} from "../../controllers/v1/application.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post(
  "/applications/search",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
  listApplications,
);

router.get(
  "/applications/:id",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
  getApplicationById,
);

router.patch(
  "/applications/:id/status",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  updateApplicationStatus,
);

router.post(
  "/applications/export",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  exportApplications,
);

export default router;
