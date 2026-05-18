import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
  submitQuery,
  listQueries,
  updateQueryStatus,
} from "../../controllers/v1/helpQuery.controller.js";

const router = express.Router();

// Public — citizens submit help queries
router.post("/help/query", submitQuery);

// Admin — view and manage queries
router.post(
  "/help/queries/search",
  authMiddleware(["SUPER_ADMIN", "DEPT_ADMIN", "ADMIN"]),
  listQueries,
);
router.patch(
  "/help/queries/:id/status",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  updateQueryStatus,
);

export default router;
