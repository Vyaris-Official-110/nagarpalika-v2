import { Router } from "express";
import {
  sendAadhaarOtp,
  verifyAadhaarOtp,
  sendEmailOtp,
  verifyEmailOtp,
  getMyProfile,
  saveStep,
  uploadPhoto,
  uploadSignature,
  submitRegistration,
  candidateLogin,
  candidateLogout,
  findSendOtp,
  findVerifyOtp,
  passwordResetSendOtp,
  passwordResetVerify,
  editConfirmSendOtp,
  editConfirmVerifyOtp,
  editVerifyAccessSend,
  editVerifyAccessOtp,
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

// Public — Aadhaar OTP (step 1)
router.post("/otr/aadhaar/send-otp", sendAadhaarOtp);
router.post("/otr/aadhaar/verify-otp", verifyAadhaarOtp);

// Public — Login
router.post("/otr/login", candidateLogin);

// Public — Find Registration (two-step, gap 3)
router.post("/otr/find/send-otp", findSendOtp);
router.post("/otr/find/verify-otp", findVerifyOtp);

// Public — Password Reset (gap 8)
router.post("/otr/password-reset/send", passwordResetSendOtp);
router.post("/otr/password-reset/verify", passwordResetVerify);

// Public — Edit Verify Access (gap 11)
router.post("/otr/edit/verify-access", editVerifyAccessSend);
router.post("/otr/edit/verify-access/otp", editVerifyAccessOtp);

// Authenticated — Profile + Steps
router.get("/otr/me", candidateAuth, getMyProfile);
router.put("/otr/step/:step", candidateAuth, saveStep);

// Authenticated — Email OTP (gap 2)
router.post("/otr/email/send-otp", candidateAuth, sendEmailOtp);
router.post("/otr/email/verify-otp", candidateAuth, verifyEmailOtp);

// Authenticated — File Uploads
router.post("/otr/upload/photo", candidateAuth, photoUpload, uploadPhoto);
router.post(
  "/otr/upload/signature",
  candidateAuth,
  signatureUpload,
  uploadSignature,
);

// Authenticated — Submit + Edit Confirm OTP (gap 10)
router.post("/otr/submit", candidateAuth, submitRegistration);
router.post("/otr/edit/confirm/send", candidateAuth, editConfirmSendOtp);
router.post("/otr/edit/confirm/verify", candidateAuth, editConfirmVerifyOtp);

// Authenticated — Logout
router.post("/otr/logout", candidateAuth, candidateLogout);

export default router;
