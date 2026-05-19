import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { roleScope } from "../../middlewares/roleScope.js";
import { createSecureDocumentUpload } from "../../middlewares/secureUpload.js";
import {
  createAdvertisement,
  updateAdvertisement,
  publishAdvertisement,
  closeAdvertisement,
  archiveAdvertisement,
  deleteAdvertisement,
  getAdvertisementById,
  listAdvertisements,
  listAdvertisementsByParams,
  uploadAdvertisementPdf,
  serveAdvertisementPdf,
  bulkExportZip,
} from "../../controllers/v1/advertisement.controller.js";

const router = express.Router();

const pdfUpload = createSecureDocumentUpload({
  destination: "uploads/advertisements",
  fieldName: "pdf",
  maxSize: 10 * 1024 * 1024,
});

// Public
router.get("/advertisements", listAdvertisements);
router.get("/advertisements/:id", getAdvertisementById);
router.get("/advertisements/:id/pdf", serveAdvertisementPdf);

// Admin — DEPT_ADMIN scope enforced via roleScope + controller check (PRD §9.3)
router.post(
  "/advertisements",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
  roleScope,
  createAdvertisement,
);
router.put(
  "/advertisements/:id",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
  roleScope,
  updateAdvertisement,
);
router.patch(
  "/advertisements/:id/publish",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  publishAdvertisement,
);
router.patch(
  "/advertisements/:id/close",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  closeAdvertisement,
);
router.patch(
  "/advertisements/:id/archive",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  archiveAdvertisement,
);
router.delete(
  "/advertisements/:id",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  deleteAdvertisement,
);
router.post(
  "/advertisements/search",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
  listAdvertisementsByParams,
);
// PDF upload — PRD §5.8.2
router.post(
  "/advertisements/:id/pdf",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
  pdfUpload,
  uploadAdvertisementPdf,
);
// Bulk ZIP export — PRD §5.8.8 (stub until P4)
router.post(
  "/advertisements/:id/export-zip",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  bulkExportZip,
);

export default router;
