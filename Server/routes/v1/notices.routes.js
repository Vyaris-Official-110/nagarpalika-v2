import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
  listNotices,
  getNoticeById,
  createNotice,
  publishNotice,
  deleteNotice,
  listNoticesByParams,
} from "../../controllers/v1/notice.controller.js";

const router = express.Router();

// Public — citizens browse published notices
router.get("/notices", listNotices);
router.get("/notices/:id", getNoticeById);

// Admin — create, publish, delete
router.post(
  "/notices",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
  createNotice,
);
router.patch(
  "/notices/:id/publish",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  publishNotice,
);
router.delete(
  "/notices/:id",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  deleteNotice,
);
router.post(
  "/notices/search",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
  listNoticesByParams,
);

export default router;
