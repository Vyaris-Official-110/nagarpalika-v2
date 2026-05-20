import crypto from "crypto";
import bcrypt from "bcrypt";
import Candidate from "../../models/Candidate.js";
import Otp from "../../models/Otp.js";
import { generateRegistrationId } from "../../utils/registrationId.js";
import { sendSmsOtp, sendSmsText } from "../../services/sms.service.js";
import { sendEmail } from "../../services/email.service.js";

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

// gap 4: password policy
function validatePassword(password) {
  if (!password || password.length < 8)
    return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one digit";
  if (!/[!@#$%^&*()\-_+=[\]{}|;:'",.<>/?\\]/.test(password))
    return "Password must contain at least one special character";
  return null;
}

// gap 6: Verhoeff algorithm for Aadhaar checksum
const VD = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const VP = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

function verhoeffCheck(num) {
  let c = 0;
  String(num)
    .split("")
    .reverse()
    .forEach((d, i) => {
      c = VD[c][VP[i % 8][parseInt(d, 10)]];
    });
  return c === 0;
}

function dobMatches(storedDob, inputDob) {
  const stored = new Date(storedDob);
  const input = new Date(inputDob);
  if (isNaN(stored.getTime()) || isNaN(input.getTime())) return false;
  return stored.toDateString() === input.toDateString();
}

async function checkOtpRateLimit(phone, type) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const count = await Otp.countDocuments({
    phone,
    type,
    createdAt: { $gte: oneHourAgo },
  });
  return count >= OTP_RATE_LIMIT_PER_HOUR;
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
    // gap 6: Verhoeff checksum validation
    if (!verhoeffCheck(aadhaar.trim())) {
      return res.status(400).json({
        isOk: false,
        message: "Invalid Aadhaar number (checksum failed)",
      });
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

    if (await checkOtpRateLimit(mobile.trim(), "aadhaar_otp")) {
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
      lastActivity: Date.now(),
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

// ── Email OTP (gap 2) ──────────────────────────────────────────────────────────

export const sendEmailOtp = async (req, res) => {
  try {
    const candidate = req.candidate;
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid email address" });
    }

    if (await checkOtpRateLimit(email.trim().toLowerCase(), "email_otp")) {
      return res.status(429).json({
        isOk: false,
        message: "Too many OTP requests. Please try again after an hour.",
      });
    }

    await Otp.deleteMany({
      email: email.trim().toLowerCase(),
      type: "email_otp",
    });

    const otp = generateOtp();
    await Otp.create({
      email: email.trim().toLowerCase(),
      type: "email_otp",
      otp,
    });

    req.session.emailVerify = { email: email.trim().toLowerCase() };

    await sendEmail({
      to: email.trim(),
      subject: "NagarPalika OTR — Email Verification OTP",
      text: `Your OTP for email verification is: ${otp}\n\nThis OTP is valid for 5 minutes.`,
    });

    const response = {
      isOk: true,
      message: "OTP sent to your email address",
    };
    if (isDev()) response._devOtp = otp;

    return res.status(200).json(response);
  } catch (err) {
    console.error("sendEmailOtp error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

export const verifyEmailOtp = async (req, res) => {
  try {
    const candidate = req.candidate;
    const { otp } = req.body;

    if (!otp || !/^\d{6}$/.test(otp.trim())) {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid OTP format" });
    }

    const emailSession = req.session.emailVerify;
    if (!emailSession?.email) {
      return res
        .status(400)
        .json({ isOk: false, message: "Session expired. Request a new OTP." });
    }

    const { email } = emailSession;

    const otpDoc = await Otp.findOne({ email, type: "email_otp" });
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
    req.session.emailVerify = null;

    await Candidate.findByIdAndUpdate(candidate._id, {
      $set: { email, emailVerified: true },
    });

    return res
      .status(200)
      .json({ isOk: true, message: "Email verified successfully" });
  } catch (err) {
    console.error("verifyEmailOtp error:", err);
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

// gap 13: fields regrouped to match PRD step layout
const STEP_FIELDS = {
  2: ["name", "fatherName", "dob", "gender", "category", "nationality", "religion"],
  3: ["email", "altMobile"],
  4: ["permanentAddress", "currentAddress", "currentSameAsPermanent"],
  5: [
    "maritalStatus",
    "exServiceman",
    "motherTongue",
    "phStatus",
    "phType",
    "phPercentage",
    "qualification",
  ],
  6: ["languages"],
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
          otrStep: Math.max(candidate.otrStep, 7), // gap 13: photo is now step 7
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
          otrStep: Math.max(candidate.otrStep, 8), // gap 13: signature is now step 8
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
      return res
        .status(400)
        .json({ isOk: false, message: "CAPTCHA required" });
    }

    // gap 4: full password policy
    const pwError = validatePassword(password);
    if (pwError) {
      return res.status(400).json({ isOk: false, message: pwError });
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

    // gap 12: email confirmation
    if (fullCandidate.email) {
      await sendEmail({
        to: fullCandidate.email,
        subject: "NagarPalika OTR — Registration Successful",
        text:
          `Dear ${fullCandidate.name || "Applicant"},\n\n` +
          `Your One-Time Registration is complete.\n` +
          `Registration ID: ${fullCandidate.registrationId}\n\n` +
          `You can edit your registration within 48 hours of this confirmation.\n\n` +
          `NagarPalika Recruitment Portal`,
      });
    }

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
    const { registrationId, aadhaar, password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ isOk: false, message: "Password required" });
    }

    let candidate;

    // gap 7: support login by Aadhaar or Registration ID
    if (aadhaar) {
      if (!/^\d{12}$/.test(aadhaar.trim()) || !verhoeffCheck(aadhaar.trim())) {
        return res
          .status(400)
          .json({ isOk: false, message: "Invalid Aadhaar number" });
      }
      const aadhaarHash = hashAadhaar(aadhaar);
      candidate = await Candidate.findOne({
        aadhaarHash,
        tenantId: req.tenantId,
        registrationCompleted: true,
      });
    } else if (registrationId) {
      candidate = await Candidate.findOne({
        registrationId: registrationId.trim().toUpperCase(),
        tenantId: req.tenantId,
        registrationCompleted: true,
      });
    } else {
      return res.status(400).json({
        isOk: false,
        message: "Registration ID or Aadhaar required",
      });
    }

    if (!candidate) {
      return res.status(401).json({
        isOk: false,
        message: "Invalid credentials",
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

    const passwordMatch = await bcrypt.compare(password, candidate.passwordHash);

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
        message: "Invalid credentials",
      });
    }

    candidate.loginAttempts = 0;
    candidate.lockoutUntil = undefined;

    // Single-session enforcement — PRD §9.1
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
      lastActivity: Date.now(),
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

// ── Find Registration — two-step OTP flow (gap 3) ─────────────────────────────

export const findSendOtp = async (req, res) => {
  try {
    const { mode, mobile, aadhaar, dob } = req.body;

    if (!dob) {
      return res
        .status(400)
        .json({ isOk: false, message: "Date of birth required" });
    }

    let candidate;
    let targetMobile;

    if (mode === "mobile") {
      if (!mobile || !/^\d{10}$/.test(mobile.trim())) {
        return res
          .status(400)
          .json({ isOk: false, message: "Invalid mobile number" });
      }
      candidate = await Candidate.findOne({
        mobile: mobile.trim(),
        tenantId: req.tenantId,
        registrationCompleted: true,
      });
      if (candidate && !dobMatches(candidate.dob, dob)) candidate = null;
      targetMobile = mobile.trim();
    } else if (mode === "aadhaar") {
      if (!aadhaar || !/^\d{12}$/.test(aadhaar.trim()) || !verhoeffCheck(aadhaar.trim())) {
        return res
          .status(400)
          .json({ isOk: false, message: "Invalid Aadhaar number" });
      }
      const aadhaarHash = hashAadhaar(aadhaar);
      candidate = await Candidate.findOne({
        aadhaarHash,
        tenantId: req.tenantId,
        registrationCompleted: true,
      });
      if (candidate && !dobMatches(candidate.dob, dob)) candidate = null;
      targetMobile = candidate?.mobile;
    } else {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid mode. Use 'mobile' or 'aadhaar'" });
    }

    // Send OTP if candidate found; same response regardless (enumeration prevention)
    if (candidate && targetMobile) {
      if (!(await checkOtpRateLimit(targetMobile, "find_otp"))) {
        await Otp.deleteMany({ phone: targetMobile, type: "find_otp" });
        const otp = generateOtp();
        await Otp.create({ phone: targetMobile, type: "find_otp", otp });
        req.session.findOtp = { mobile: targetMobile };
        await sendSmsOtp(targetMobile, otp);
        if (isDev()) {
          return res.status(200).json({
            isOk: true,
            message: "If details match, OTP sent to registered mobile",
            _devOtp: otp,
          });
        }
      }
    } else {
      req.session.findOtp = null;
    }

    return res.status(200).json({
      isOk: true,
      message: "If details match, OTP has been sent to the registered mobile number",
    });
  } catch (err) {
    console.error("findSendOtp error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

export const findVerifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp || !/^\d{6}$/.test(otp.trim())) {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid OTP format" });
    }

    const findSession = req.session.findOtp;
    if (!findSession?.mobile) {
      return res
        .status(400)
        .json({ isOk: false, message: "Session expired. Start over." });
    }

    const { mobile } = findSession;
    const otpDoc = await Otp.findOne({ phone: mobile, type: "find_otp" });

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
    req.session.findOtp = null;

    const candidate = await Candidate.findOne({
      mobile,
      tenantId: req.tenantId,
      registrationCompleted: true,
    });

    if (candidate) {
      // Send Reg ID via SMS and email — NOT in response body (enumeration prevention)
      await sendSmsText(
        mobile,
        `Your NagarPalika Registration ID: ${candidate.registrationId}`,
      );
      if (candidate.email) {
        await sendEmail({
          to: candidate.email,
          subject: "NagarPalika OTR — Your Registration ID",
          text: `Your NagarPalika Registration ID is: ${candidate.registrationId}\n\nIf you did not request this, please ignore this message.`,
        });
      }
    }

    return res.status(200).json({
      isOk: true,
      message:
        "Your Registration ID has been sent to your registered mobile number and email address",
    });
  } catch (err) {
    console.error("findVerifyOtp error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

// ── Password Reset (gap 8) ─────────────────────────────────────────────────────

export const passwordResetSendOtp = async (req, res) => {
  try {
    const { registrationId, dob } = req.body;

    if (!registrationId || !dob) {
      return res.status(400).json({
        isOk: false,
        message: "Registration ID and date of birth required",
      });
    }

    const candidate = await Candidate.findOne({
      registrationId: registrationId.trim().toUpperCase(),
      tenantId: req.tenantId,
      registrationCompleted: true,
    });

    // Same response regardless — enumeration prevention
    if (candidate && dobMatches(candidate.dob, dob)) {
      if (!(await checkOtpRateLimit(candidate.mobile, "reset_otp"))) {
        await Otp.deleteMany({ phone: candidate.mobile, type: "reset_otp" });
        const otp = generateOtp();
        await Otp.create({ phone: candidate.mobile, type: "reset_otp", otp });
        req.session.resetOtp = {
          mobile: candidate.mobile,
          registrationId: candidate.registrationId,
        };
        await sendSmsOtp(candidate.mobile, otp);
        if (isDev()) {
          return res.status(200).json({
            isOk: true,
            message: "If details match, OTP sent to registered mobile",
            _devOtp: otp,
          });
        }
      }
    } else {
      req.session.resetOtp = null;
    }

    return res.status(200).json({
      isOk: true,
      message:
        "If details match, an OTP has been sent to your registered mobile number",
    });
  } catch (err) {
    console.error("passwordResetSendOtp error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

export const passwordResetVerify = async (req, res) => {
  try {
    const { otp, newPassword, confirmPassword } = req.body;

    if (!otp || !/^\d{6}$/.test(otp.trim())) {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid OTP format" });
    }

    const resetSession = req.session.resetOtp;
    if (!resetSession?.mobile || !resetSession?.registrationId) {
      return res
        .status(400)
        .json({ isOk: false, message: "Session expired. Start over." });
    }

    const { mobile, registrationId } = resetSession;
    const otpDoc = await Otp.findOne({ phone: mobile, type: "reset_otp" });

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

    const pwError = validatePassword(newPassword);
    if (pwError) {
      return res.status(400).json({ isOk: false, message: pwError });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ isOk: false, message: "Passwords do not match" });
    }

    await Otp.deleteOne({ _id: otpDoc._id });
    req.session.resetOtp = null;

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await Candidate.findOneAndUpdate(
      { registrationId, tenantId: req.tenantId },
      { $set: { passwordHash, activeSessionId: null } },
    );

    return res.status(200).json({
      isOk: true,
      message: "Password reset successful. Please log in with your new password.",
    });
  } catch (err) {
    console.error("passwordResetVerify error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

// ── Edit Confirm OTP — final submit gate (gap 10) ─────────────────────────────

export const editConfirmSendOtp = async (req, res) => {
  try {
    const candidate = req.candidate;

    if (!(await checkOtpRateLimit(candidate.mobile, "edit_access_otp"))) {
      await Otp.deleteMany({
        phone: candidate.mobile,
        type: "edit_access_otp",
      });
      const otp = generateOtp();
      await Otp.create({
        phone: candidate.mobile,
        type: "edit_access_otp",
        otp,
      });
      await sendSmsOtp(candidate.mobile, otp);

      const response = { isOk: true, message: "OTP sent to your registered mobile number" };
      if (isDev()) response._devOtp = otp;
      return res.status(200).json(response);
    }

    return res.status(429).json({
      isOk: false,
      message: "Too many OTP requests. Please try again after an hour.",
    });
  } catch (err) {
    console.error("editConfirmSendOtp error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

export const editConfirmVerifyOtp = async (req, res) => {
  try {
    const candidate = req.candidate;
    const { otp } = req.body;

    if (!otp || !/^\d{6}$/.test(otp.trim())) {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid OTP format" });
    }

    const otpDoc = await Otp.findOne({
      phone: candidate.mobile,
      type: "edit_access_otp",
    });

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
    return res
      .status(200)
      .json({ isOk: true, message: "OTP verified. Saving your changes." });
  } catch (err) {
    console.error("editConfirmVerifyOtp error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

// ── Edit Verify Access — pre-edit identity check (gap 11) ─────────────────────

export const editVerifyAccessSend = async (req, res) => {
  try {
    const { mode, registrationId, dob, aadhaar } = req.body;

    if (mode === "regid") {
      if (!registrationId || !dob) {
        return res.status(400).json({
          isOk: false,
          message: "Registration ID and date of birth required",
        });
      }

      const candidate = await Candidate.findOne(
        {
          registrationId: registrationId.trim().toUpperCase(),
          tenantId: req.tenantId,
          registrationCompleted: true,
        },
        { passwordHash: 0, aadhaarHash: 0 },
      );

      if (!candidate || !dobMatches(candidate.dob, dob) || !candidate.isActive) {
        return res.status(401).json({
          isOk: false,
          message: "Details not found or do not match",
        });
      }

      const editExpired =
        candidate.editWindowExpiresAt &&
        candidate.editWindowExpiresAt < new Date();
      if (editExpired) {
        return res.status(403).json({
          isOk: false,
          message: "Edit window has expired (48 hours)",
        });
      }

      // Create session directly (no password required for edit access via RegID+DOB)
      const sessionToken = crypto.randomBytes(32).toString("hex");
      await Candidate.findByIdAndUpdate(candidate._id, {
        $set: { activeSessionId: sessionToken },
      });

      await new Promise((resolve, reject) =>
        req.session.regenerate((err) => (err ? reject(err) : resolve())),
      );

      req.session.candidate = {
        candidateId: candidate._id.toString(),
        registrationId: candidate.registrationId,
        tenantId: req.tenantId,
        sessionToken,
        lastActivity: Date.now(),
      };

      return res.status(200).json({
        isOk: true,
        message: "Identity verified",
        data: {
          registrationId: candidate.registrationId,
          name: candidate.name,
          editWindowExpiresAt: candidate.editWindowExpiresAt,
        },
      });
    } else if (mode === "aadhaar") {
      if (!aadhaar || !/^\d{12}$/.test(aadhaar.trim()) || !verhoeffCheck(aadhaar.trim())) {
        return res
          .status(400)
          .json({ isOk: false, message: "Invalid Aadhaar number" });
      }

      const aadhaarHash = hashAadhaar(aadhaar);
      const candidate = await Candidate.findOne({
        aadhaarHash,
        tenantId: req.tenantId,
        registrationCompleted: true,
      });

      // Send OTP if found; same response regardless (enumeration prevention)
      if (candidate && candidate.isActive) {
        const editExpired =
          candidate.editWindowExpiresAt &&
          candidate.editWindowExpiresAt < new Date();

        if (!editExpired && !(await checkOtpRateLimit(candidate.mobile, "edit_access_otp"))) {
          await Otp.deleteMany({
            phone: candidate.mobile,
            type: "edit_access_otp",
          });
          const otp = generateOtp();
          await Otp.create({
            phone: candidate.mobile,
            type: "edit_access_otp",
            otp,
          });
          req.session.editAccess = {
            aadhaarHash,
            tenantId: req.tenantId,
          };
          await sendSmsOtp(candidate.mobile, otp);

          if (isDev()) {
            return res.status(200).json({
              isOk: true,
              message: "If Aadhaar found, OTP sent to registered mobile",
              _devOtp: otp,
            });
          }
        }
      } else {
        req.session.editAccess = null;
      }

      return res.status(200).json({
        isOk: true,
        message:
          "If your Aadhaar is registered, an OTP has been sent to your registered mobile number",
      });
    } else {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid mode. Use 'regid' or 'aadhaar'" });
    }
  } catch (err) {
    console.error("editVerifyAccessSend error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};

export const editVerifyAccessOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp || !/^\d{6}$/.test(otp.trim())) {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid OTP format" });
    }

    const editSession = req.session.editAccess;
    if (!editSession?.aadhaarHash) {
      return res
        .status(400)
        .json({ isOk: false, message: "Session expired. Start over." });
    }

    const candidate = await Candidate.findOne(
      {
        aadhaarHash: editSession.aadhaarHash,
        tenantId: editSession.tenantId,
        registrationCompleted: true,
      },
      { passwordHash: 0, aadhaarHash: 0 },
    );

    if (!candidate || !candidate.isActive) {
      req.session.editAccess = null;
      return res.status(401).json({ isOk: false, message: "Invalid session" });
    }

    const otpDoc = await Otp.findOne({
      phone: candidate.mobile,
      type: "edit_access_otp",
    });

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
    req.session.editAccess = null;

    const editExpired =
      candidate.editWindowExpiresAt &&
      candidate.editWindowExpiresAt < new Date();
    if (editExpired) {
      return res.status(403).json({
        isOk: false,
        message: "Edit window has expired (48 hours)",
      });
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    await Candidate.findByIdAndUpdate(candidate._id, {
      $set: { activeSessionId: sessionToken },
    });

    await new Promise((resolve, reject) =>
      req.session.regenerate((err) => (err ? reject(err) : resolve())),
    );

    req.session.candidate = {
      candidateId: candidate._id.toString(),
      registrationId: candidate.registrationId,
      tenantId: req.tenantId,
      sessionToken,
      lastActivity: Date.now(),
    };

    return res.status(200).json({
      isOk: true,
      message: "Identity verified",
      data: {
        registrationId: candidate.registrationId,
        name: candidate.name,
        editWindowExpiresAt: candidate.editWindowExpiresAt,
      },
    });
  } catch (err) {
    console.error("editVerifyAccessOtp error:", err);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error" });
  }
};
