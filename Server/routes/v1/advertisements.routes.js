import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
  createAdvertisement,
  updateAdvertisement,
  publishAdvertisement,
  closeAdvertisement,
  deleteAdvertisement,
  getAdvertisementById,
  listAdvertisements,
  listAdvertisementsByParams,
} from "../../controllers/v1/advertisement.controller.js";

const router = express.Router();

// Public — citizens can browse published advertisements
router.get("/advertisements", listAdvertisements);
router.get("/advertisements/:id", getAdvertisementById);

// Admin — create, edit, publish, close, delete
router.post(
  "/advertisements",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
  createAdvertisement,
);
router.put(
  "/advertisements/:id",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
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

export default router;
