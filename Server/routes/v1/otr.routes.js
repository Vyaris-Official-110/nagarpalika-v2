import { Router } from "express";
import {
  sendAadhaarOtp,
  verifyAadhaarOtp,
  getMyProfile,
  saveStep,
  uploadPhoto,
  uploadSignature,
  submitRegistration,
  candidateLogin,
  candidateLogout,
  findRegistration,
} from "../../controllers/v1/otr.controller.js";
import { candidateAuth } from "../../middlewares/candidateAuth.js";
import { createSecureImageUpload } from "../../middlewares/secureUpload.js";

const router = Router();

const photoUpload = createSecureImageUpload({
  destination: "uploads/candidates",
  fieldName: "photo",
  maxSize: 2 * 1024 * 1024,
  quality: 80,
});

const signatureUpload = createSecureImageUpload({
  destination: "uploads/candidates",
  fieldName: "signature",
  maxSize: 1 * 1024 * 1024,
  quality: 85,
});

// Public
router.post("/otr/aadhaar/send-otp", sendAadhaarOtp);
router.post("/otr/aadhaar/verify-otp", verifyAadhaarOtp);
router.post("/otr/login", candidateLogin);
router.post("/otr/find", findRegistration);

// Authenticated
router.get("/otr/me", candidateAuth, getMyProfile);
router.put("/otr/step/:step", candidateAuth, saveStep);
router.post("/otr/upload/photo", candidateAuth, photoUpload, uploadPhoto);
router.post(
  "/otr/upload/signature",
  candidateAuth,
  signatureUpload,
  uploadSignature,
);
router.post("/otr/submit", candidateAuth, submitRegistration);
router.post("/otr/logout", candidateAuth, candidateLogout);

export default router;
