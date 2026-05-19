import crypto from "crypto";
import bcrypt from "bcrypt";
import Candidate from "../../models/Candidate.js";
import Otp from "../../models/Otp.js";
import { generateRegistrationId } from "../../utils/registrationId.js";
import { sendSmsOtp, sendSmsText } from "../../services/sms.service.js";

const BCRYPT_ROUNDS = 12;
const MAX_OTP_ATTEMPTS = 3;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const EDIT_WINDOW_HOURS = 48;
const OTP_RATE_LIMIT_PER_HOUR = 3;

function hashAadhaar(aadhaar) {
  return crypto.createHash("sha256").update(aadhaar.trim()).digest("hex");
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isDev() {
  return process.env.NODE_ENV !== "production";
}

// ── Aadhaar OTP ────────────────────────────────────────────────────────────────

export const sendAadhaarOtp = async (req, res) => {
  try {
    const { aadhaar, mobile } = req.body;

    if (!aadhaar || !/^\d{12}$/.test(aadhaar.trim())) {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid Aadhaar number" });
    }
    if (!mobile || !/^\d{10}$/.test(mobile.trim())) {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid mobile number" });
    }

    const aadhaarHash = hashAadhaar(aadhaar);

    const existing = await Candidate.findOne({
      aadhaarHash,
      tenantId: req.tenantId,
      registrationCompleted: true,
    });
    if (existing) {
      return res.status(409).json({
        isOk: false,
        message:
          "This Aadhaar is already registered. Use 'Find Registration' to retrieve your ID.",
      });
    }

    // Rate limit: max 3 OTPs per hour per mobile
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtps = await Otp.countDocuments({
      phone: mobile.trim(),
      type: "aadhaar_otp",
      createdAt: { $gte: oneHourAgo },
    });
    if (recentOtps >= OTP_RATE_LIMIT_PER_HOUR) {
      return res.status(429).json({
        isOk: false,
        message: "Too many OTP requests. Please try again after an hour.",
      });
    }

    await Otp.deleteMany({ phone: mobile.trim(), type: "aadhaar_otp" });

    const otp = generateOtp();
    await Otp.create({ phone: mobile.trim(), type: "aadhaar_otp", otp });

    req.session.otr = { aadhaarHash, mobile: mobile.trim() };

    await sendSmsOtp(mobile.trim(), otp);

    const response = { isOk: true, message: "OTP sent to your mobile number" };
    if (isDev()) response._devOtp = otp;

    return res.status(200).json(response);
  } catch (err) {
    console.error("sendAadhaarOtp error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

export const verifyAadhaarOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp || !/^\d{6}$/.test(otp.trim())) {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid OTP format" });
    }

    const preSession = req.session.otr;
    if (!preSession?.aadhaarHash || !preSession?.mobile) {
      return res
        .status(400)
        .json({ isOk: false, message: "Session expired. Start over." });
    }

    const { aadhaarHash, mobile } = preSession;

    const otpDoc = await Otp.findOne({ phone: mobile, type: "aadhaar_otp" });
    if (!otpDoc) {
      return res
        .status(400)
        .json({ isOk: false, message: "OTP expired. Request a new one." });
    }

    if (otpDoc.attempts >= MAX_OTP_ATTEMPTS) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({
        isOk: false,
        message: "Too many incorrect attempts. Request a new OTP.",
      });
    }

    if (otpDoc.otp !== otp.trim()) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      const remaining = MAX_OTP_ATTEMPTS - otpDoc.attempts;
      return res.status(400).json({
        isOk: false,
        message: `Incorrect OTP. ${remaining} attempt(s) remaining.`,
      });
    }

    await Otp.deleteOne({ _id: otpDoc._id });

    let candidate = await Candidate.findOne({
      aadhaarHash,
      tenantId: req.tenantId,
    });

    if (!candidate) {
      const registrationId = await generateRegistrationId(req.tenantId);
      candidate = await Candidate.create({
        registrationId,
        aadhaarHash,
        mobile,
        tenantId: req.tenantId,
        otrStep: 1,
        registrationCompleted: false,
      });
    }

    // Session fixation prevention
    await new Promise((resolve, reject) =>
      req.session.regenerate((err) => (err ? reject(err) : resolve())),
    );

    req.session.candidate = {
      candidateId: candidate._id.toString(),
      registrationId: candidate.registrationId,
      tenantId: req.tenantId,
    };

    return res.status(200).json({
      isOk: true,
      message: "Aadhaar verified",
      registrationId: candidate.registrationId,
      otrStep: candidate.otrStep,
    });
  } catch (err) {
    console.error("verifyAadhaarOtp error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

// ── Profile ────────────────────────────────────────────────────────────────────

export const getMyProfile = async (req, res) => {
  try {
    return res.status(200).json({ isOk: true, data: req.candidate });
  } catch (err) {
    console.error("getMyProfile error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

// ── Step Save ──────────────────────────────────────────────────────────────────

const STEP_FIELDS = {
  2: [
    "name",
    "fatherName",
    "dob",
    "gender",
    "category",
    "nationality",
    "religion",
    "maritalStatus",
    "exServiceman",
    "motherTongue",
  ],
  3: ["email", "altMobile"],
  4: ["permanentAddress", "currentAddress", "currentSameAsPermanent"],
  5: ["qualification"],
  6: ["languages"],
  7: ["phStatus", "phType", "phPercentage"],
};

export const saveStep = async (req, res) => {
  try {
    const step = Number(req.params.step);
    const candidate = req.candidate;

    if (!STEP_FIELDS[step]) {
      return res.status(400).json({ isOk: false, message: "Invalid step" });
    }

    if (candidate.registrationCompleted) {
      const editExpired =
        candidate.editWindowExpiresAt &&
        candidate.editWindowExpiresAt < new Date();
      if (editExpired) {
        return res.status(403).json({
          isOk: false,
          message:
            "Edit window has expired (48 hours). Contact the exam authority.",
        });
      }
    }

    const allowed = STEP_FIELDS[step];
    const update = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }

    if (step === 4 && req.body.currentSameAsPermanent) {
      update.currentAddress = req.body.permanentAddress;
    }

    const maxStep = Math.max(candidate.otrStep, step);
    update.otrStep = maxStep;

    const updated = await Candidate.findByIdAndUpdate(
      candidate._id,
      { $set: update },
      { new: true, select: "-passwordHash -aadhaarHash" },
    );

    req.session.candidate.step = maxStep;

    return res.status(200).json({ isOk: true, data: updated });
  } catch (err) {
    console.error("saveStep error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

// ── File Uploads ───────────────────────────────────────────────────────────────

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ isOk: false, message: "No photo uploaded" });
    }

    const candidate = req.candidate;

    if (candidate.registrationCompleted) {
      const editExpired =
        candidate.editWindowExpiresAt &&
        candidate.editWindowExpiresAt < new Date();
      if (editExpired) {
        return res
          .status(403)
          .json({ isOk: false, message: "Edit window has expired" });
      }
    }

    const updated = await Candidate.findByIdAndUpdate(
      candidate._id,
      {
        $set: {
          photoPath: req.file.filename || req.file.path,
          otrStep: Math.max(candidate.otrStep, 8),
        },
      },
      { new: true, select: "-passwordHash -aadhaarHash" },
    );

    return res.status(200).json({ isOk: true, data: updated });
  } catch (err) {
    console.error("uploadPhoto error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

export const uploadSignature = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ isOk: false, message: "No signature uploaded" });
    }

    const candidate = req.candidate;

    if (candidate.registrationCompleted) {
      const editExpired =
        candidate.editWindowExpiresAt &&
        candidate.editWindowExpiresAt < new Date();
      if (editExpired) {
        return res
          .status(403)
          .json({ isOk: false, message: "Edit window has expired" });
      }
    }

    const updated = await Candidate.findByIdAndUpdate(
      candidate._id,
      {
        $set: {
          signaturePath: req.file.filename || req.file.path,
          otrStep: Math.max(candidate.otrStep, 9),
        },
      },
      { new: true, select: "-passwordHash -aadhaarHash" },
    );

    return res.status(200).json({ isOk: true, data: updated });
  } catch (err) {
    console.error("uploadSignature error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

// ── Final Submit ───────────────────────────────────────────────────────────────

export const submitRegistration = async (req, res) => {
  try {
    const { password, confirmPassword, captchaToken } = req.body;
    const candidate = req.candidate;

    if (candidate.registrationCompleted) {
      return res.status(400).json({
        isOk: false,
        message: "Registration already completed",
        registrationId: candidate.registrationId,
      });
    }

    const captchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (captchaSecret && captchaToken) {
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${captchaSecret}&response=${captchaToken}`;
      const captchaRes = await fetch(verifyUrl, { method: "POST" });
      const captchaData = await captchaRes.json();
      if (!captchaData.success) {
        return res
          .status(400)
          .json({ isOk: false, message: "CAPTCHA verification failed" });
      }
    } else if (captchaSecret && !captchaToken) {
      return res.status(400).json({ isOk: false, message: "CAPTCHA required" });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        isOk: false,
        message: "Password must be at least 8 characters",
      });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ isOk: false, message: "Passwords do not match" });
    }

    const fullCandidate = await Candidate.findById(candidate._id);
    if (!fullCandidate.name || !fullCandidate.dob || !fullCandidate.mobile) {
      return res.status(400).json({
        isOk: false,
        message: "Complete all required steps before submitting",
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const editWindowExpiresAt = new Date(
      Date.now() + EDIT_WINDOW_HOURS * 60 * 60 * 1000,
    );

    await Candidate.findByIdAndUpdate(candidate._id, {
      $set: {
        passwordHash,
        registrationCompleted: true,
        otrStep: 10,
        editWindowExpiresAt,
      },
    });

    await sendSmsText(
      fullCandidate.mobile,
      `Registration complete! Your NagarPalika Registration ID: ${fullCandidate.registrationId}. Keep it safe.`,
    );

    return res.status(200).json({
      isOk: true,
      message: "Registration completed successfully",
      registrationId: fullCandidate.registrationId,
      editWindowExpiresAt,
    });
  } catch (err) {
    console.error("submitRegistration error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

// ── Auth ───────────────────────────────────────────────────────────────────────

export const candidateLogin = async (req, res) => {
  try {
    const { registrationId, password } = req.body;

    if (!registrationId || !password) {
      return res.status(400).json({
        isOk: false,
        message: "Registration ID and password required",
      });
    }

    const candidate = await Candidate.findOne({
      registrationId: registrationId.trim().toUpperCase(),
      tenantId: req.tenantId,
      registrationCompleted: true,
    });

    if (!candidate) {
      return res.status(401).json({
        isOk: false,
        message: "Invalid registration ID or password",
      });
    }

    if (candidate.lockoutUntil && candidate.lockoutUntil > new Date()) {
      const remaining = Math.ceil(
        (candidate.lockoutUntil - Date.now()) / 60000,
      );
      return res.status(423).json({
        isOk: false,
        message: `Account locked. Try again in ${remaining} minute(s).`,
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      candidate.passwordHash,
    );

    if (!passwordMatch) {
      candidate.loginAttempts = (candidate.loginAttempts || 0) + 1;
      if (candidate.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        candidate.lockoutUntil = new Date(
          Date.now() + LOCKOUT_MINUTES * 60 * 1000,
        );
        candidate.loginAttempts = 0;
      }
      await candidate.save();
      return res.status(401).json({
        isOk: false,
        message: "Invalid registration ID or password",
      });
    }

    candidate.loginAttempts = 0;
    candidate.lockoutUntil = undefined;

    // Single-session enforcement — PRD §9.1: new login invalidates old session
    const sessionToken = crypto.randomBytes(32).toString("hex");
    candidate.activeSessionId = sessionToken;
    await candidate.save();

    await new Promise((resolve, reject) =>
      req.session.regenerate((err) => (err ? reject(err) : resolve())),
    );

    req.session.candidate = {
      candidateId: candidate._id.toString(),
      registrationId: candidate.registrationId,
      tenantId: req.tenantId,
      sessionToken,
    };

    return res.status(200).json({
      isOk: true,
      message: "Login successful",
      data: {
        registrationId: candidate.registrationId,
        name: candidate.name,
        otrStep: candidate.otrStep,
        registrationCompleted: candidate.registrationCompleted,
        editWindowExpiresAt: candidate.editWindowExpiresAt,
      },
    });
  } catch (err) {
    console.error("candidateLogin error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

export const candidateLogout = async (req, res) => {
  try {
    await new Promise((resolve, reject) =>
      req.session.destroy((err) => (err ? reject(err) : resolve())),
    );
    res.clearCookie("sessionId");
    return res.status(200).json({ isOk: true, message: "Logged out" });
  } catch (err) {
    console.error("candidateLogout error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

// ── Find Registration ──────────────────────────────────────────────────────────

export const findRegistration = async (req, res) => {
  try {
    const { aadhaar, mobile } = req.body;

    if (!aadhaar || !/^\d{12}$/.test(aadhaar.trim())) {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid Aadhaar number" });
    }
    if (!mobile || !/^\d{10}$/.test(mobile.trim())) {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid mobile number" });
    }

    const aadhaarHash = hashAadhaar(aadhaar);

    const candidate = await Candidate.findOne({
      aadhaarHash,
      tenantId: req.tenantId,
      registrationCompleted: true,
    });

    if (candidate && candidate.mobile === mobile.trim()) {
      await sendSmsText(
        mobile.trim(),
        `Your NagarPalika Registration ID: ${candidate.registrationId}`,
      );
    }

    // Same message regardless — enumeration prevention
    return res.status(200).json({
      isOk: true,
      message:
        "If your details match, your Registration ID has been sent to your mobile number.",
    });
  } catch (err) {
    console.error("findRegistration error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};
