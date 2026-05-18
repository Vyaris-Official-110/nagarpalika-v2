import { Router } from "express";
import {
  listCallLetters,
  getCallLetterById,
  updateCallLetter,
} from "../../controllers/v1/callLetter.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post(
  "/call-letters/search",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  listCallLetters,
);

router.get(
  "/call-letters/:id",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  getCallLetterById,
);

router.patch(
  "/call-letters/:id",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  updateCallLetter,
);

export default router;
