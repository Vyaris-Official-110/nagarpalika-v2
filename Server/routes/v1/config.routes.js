import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
  getConfig,
  updateConfig,
} from "../../controllers/v1/config.controller.js";

const router = Router();

// Public — citizens can read site config values (e.g. important_instructions)
router.get("/config/:key", getConfig);

// Admin — edit — PRD §5.8.3, §9.6
router.patch(
  "/config/:key",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  updateConfig,
);

export default router;
