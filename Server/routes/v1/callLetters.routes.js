import { Router } from "express";
import multer from "multer";
import {
  listCallLetters,
  getCallLetterById,
  updateCallLetter,
  uploadRollNumbers,
} from "../../controllers/v1/callLetter.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

const csvUpload = multer({ dest: "uploads/tmp/" }).single("csv");

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

// Roll-number CSV upload — PRD §5.8.7
router.post(
  "/call-letters/:advt_no/roll-numbers",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  csvUpload,
  uploadRollNumbers,
);

export default router;
