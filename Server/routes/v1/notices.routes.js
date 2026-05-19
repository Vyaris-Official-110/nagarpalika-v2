import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { createSecureDocumentUpload } from "../../middlewares/secureUpload.js";
import {
  listNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  publishNotice,
  deleteNotice,
  listNoticesByParams,
  uploadNoticePdf,
} from "../../controllers/v1/notice.controller.js";

const router = express.Router();

const pdfUpload = createSecureDocumentUpload({
  destination: "uploads/notices",
  fieldName: "pdf",
  maxSize: 10 * 1024 * 1024,
});

// Public
router.get("/notices", listNotices);
router.get("/notices/:id", getNoticeById);

// Admin
router.post(
  "/notices",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
  createNotice,
);
router.put(
  "/notices/:id",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
  updateNotice,
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
// PDF upload — PRD §5.8.3 (file upload, not manual path)
router.post(
  "/notices/:id/pdf",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
  pdfUpload,
  uploadNoticePdf,
);

export default router;
