import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import session from "express-session";
import { setupSwagger } from "./config/swagger.js";

// ============ SECURITY IMPORTS ============
// OWASP-compliant security middleware
import {
  securityHeaders,
  additionalSecurityHeaders,
  getCorsConfig,
  sanitizeErrors,
} from "./middlewares/securityHeaders.js";
import { mongoSanitizer } from "./middlewares/inputValidator.js";
import { tenantMiddleware } from "./middlewares/tenantMiddleware.js";
import { csrfMiddleware } from "./middlewares/csrfMiddleware.js";
import rateLimit from "express-rate-limit";

// PRD §9.11 — 100 req/min per IP (public), 50 req/min per IP (admin)
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { isOk: false, message: "Too many requests, please try again later.", status: 429 },
});

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { isOk: false, message: "Too many requests, please try again later.", status: 429 },
});

// ES6 module equivalent of __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

global.__basedir = __dirname;

// Create log directory if it doesn't exist
if (!fs.existsSync("log")) {
  fs.mkdirSync("log");
}

// Global error handling to prevent crashes
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  logError(error);
  // Don't exit the process, let it continue running
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  logError({ message: "Unhandled Promise Rejection", error: reason });
  // Don't exit the process, let it continue running
});

// Function to log errors
function logError(error) {
  let filedata = {
    datetime: new Date(),
    message: error?.message,
    stack: error?.stack,
  };
  try {
    let writecontent = [];
    if (fs.existsSync("log/error.html")) {
      let filedata = fs.readFileSync("log/error.html");
      if (filedata) {
        try {
          writecontent = JSON.parse(filedata);
        } catch {
          // If parsing fails, start with empty array
          writecontent = [];
        }
      }
    }
    writecontent.push(filedata);
    fs.writeFileSync("log/error.html", JSON.stringify(writecontent));
  } catch (err) {
    console.error("Error logging to file:", err);
  }
}

const app = express();
let databasestatus = "In-Progress";

// ============ SECURITY MIDDLEWARE (Apply FIRST) ============
// 1. Security Headers (Helmet + custom headers)
app.use(securityHeaders);
app.use(additionalSecurityHeaders);

// 2. CORS configuration (more restrictive than before)
const corsConfig = getCorsConfig();
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

// 3. Body Parsing with size limits (OWASP: limit request body size)
app.use(bodyParser.json({ limit: "10mb" })); // Reduced from 50mb for security
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// 5. MongoDB NoSQL Injection Protection
app.use(mongoSanitizer);

// 6. HTTP Parameter Pollution Prevention
app.use(hpp());

// Parse cookies (required for CSRF double-submit)
app.use(cookieParser());

// 7. Tenant isolation — attaches req.tenantId from subdomain/header
app.use(tenantMiddleware);

// 8a. CSRF protection — double-submit cookie / custom header (PRD §9.7)
app.use(csrfMiddleware);

// 8. Express Session - MongoDB Session Storage (persistent)
import MongoStore from "connect-mongo";

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "your-super-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE,
      collectionName: "sessions",
      ttl: 24 * 60 * 60, // 24 hours in seconds
      autoRemove: "native", // Use MongoDB TTL index for cleanup
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true, // Prevents XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "strict", // CSRF protection — PRD §9.1
    },
  }),
);

console.log("✅ Express session middleware configured (MongoDB storage)");

// ============ STATIC FILE SERVING ============
// Candidate documents (photo, signature) served via authenticated API endpoint — not static.
app.use("/uploads", express.static("uploads"));
// NOTE: Removed /log static serving for security - logs should not be publicly accessible

mongoose.set("strictQuery", false);
mongoose.set("debug", true);

const dbURI = process.env.DATABASE;

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("✅ DB connected");
    databasestatus = "Connected";
  })
  .catch((err) => {
    console.error("❌ DB Connection Error =>", err);
    if (err instanceof mongoose.Error.MongooseServerSelectionError) {
      console.error(
        "Server selection failed. Check network, URI, and Atlas IP whitelist.",
      );
    }
  });

// Optional: handle runtime disconnects
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ DB disconnected!");
});

mongoose.connection.on("reconnected", () => {
  console.log("♻️ DB reconnected!");
});

// ============ ADDITIONAL MIDDLEWARE ============
// Development request logging (disable in production for performance)
app.use(morgan("dev"));
app.use(express.static("files"));

// Setup Swagger documentation (consider disabling in production)
setupSwagger(app);

// ============ V1 ROUTES ============
// Import v1 routes
import companiesRoutes from "./routes/v1/companies.routes.js";
import departmentsRoutes from "./routes/v1/departments.routes.js";
import emailsRoutes from "./routes/v1/emails.routes.js";
import employeeRolesRoutes from "./routes/v1/employeeRoles.routes.js";
import employeesRoutes from "./routes/v1/employees.routes.js";
import locationsRoutes from "./routes/v1/locations.routes.js";
import menusRoutes from "./routes/v1/menus.routes.js";
import rolesRoutes from "./routes/v1/roles.routes.js";
import otpRoutes from "./routes/v1/otp.routes.js";
import masterDataRoutes from "./routes/v1/masterData.routes.js";
import analyticsRoutes from "./routes/v1/analytics.routes.js";
import whatsappRoutes from "./routes/v1/whatsapp.routes.js";
import advertisementsRoutes from "./routes/v1/advertisements.routes.js";
import noticesRoutes from "./routes/v1/notices.routes.js";
import helpQueryRoutes from "./routes/v1/helpQuery.routes.js";
import candidatesRoutes from "./routes/v1/candidates.routes.js";
import applicationsRoutes from "./routes/v1/applications.routes.js";
import feePaymentsRoutes from "./routes/v1/feePayments.routes.js";
import callLettersRoutes from "./routes/v1/callLetters.routes.js";
import otrRoutes from "./routes/v1/otr.routes.js";
import configRoutes from "./routes/v1/config.routes.js";

// Public routes — 100 req/min per IP (PRD §9.11)
app.use("/api/v1", publicLimiter, noticesRoutes);
app.use("/api/v1", publicLimiter, advertisementsRoutes);
app.use("/api/v1", publicLimiter, candidatesRoutes);
app.use("/api/v1", publicLimiter, otrRoutes);
app.use("/api/v1/otp", publicLimiter, otpRoutes);

// Admin routes — 50 req/min per IP (PRD §9.11)
app.use("/api/v1", adminLimiter, companiesRoutes);
app.use("/api/v1", adminLimiter, departmentsRoutes);
app.use("/api/v1", adminLimiter, emailsRoutes);
app.use("/api/v1", adminLimiter, employeeRolesRoutes);
app.use("/api/v1", adminLimiter, employeesRoutes);
app.use("/api/v1", adminLimiter, locationsRoutes);
app.use("/api/v1", adminLimiter, menusRoutes);
app.use("/api/v1", adminLimiter, rolesRoutes);
app.use("/api/v1", adminLimiter, analyticsRoutes);
app.use("/api/v1", adminLimiter, whatsappRoutes);
app.use("/api/v1/master-data", adminLimiter, masterDataRoutes);
app.use("/api/v1", adminLimiter, helpQueryRoutes);
app.use("/api/v1", adminLimiter, applicationsRoutes);
app.use("/api/v1", adminLimiter, feePaymentsRoutes);
app.use("/api/v1", adminLimiter, callLettersRoutes);
app.use("/api/v1", adminLimiter, configRoutes);

console.log("✅ V1 API routes loaded");

app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    message: "API server is running",
    database: databasestatus,
    timestamp: new Date().toISOString(),
  });
});

app.use("/", express.static(path.join(__dirname, "/out/admin")));

app.get("/*", async (req, res) => {
  res.sendFile(path.join(__dirname, "/out/admin", "index.html"));
});

// ============ ERROR HANDLING ============
// Use the secure error sanitizer (prevents information leakage)
app.use(sanitizeErrors);

// Fallback error handler that logs errors but doesn't expose details
// eslint-disable-next-line no-unused-vars
app.use(async (err, req, res, _next) => {
  // Log error to file for debugging
  const errorData = {
    datetime: new Date().toISOString(),
    message: err?.message,
    path: req?.path,
    method: req?.method,
    ip: req?.ip,
    // Don't log full stack trace to file in production
    stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
  };

  try {
    let writecontent = [];
    if (fs.existsSync("log/error.html")) {
      const filedata = fs.readFileSync("log/error.html", "utf8");
      if (filedata) {
        try {
          writecontent = JSON.parse(filedata);
        } catch {
          writecontent = [];
        }
      }
    }

    // Keep only last 100 errors to prevent log file from growing too large
    if (writecontent.length > 100) {
      writecontent = writecontent.slice(-100);
    }

    writecontent.push(errorData);
    fs.writeFileSync("log/error.html", JSON.stringify(writecontent, null, 2));
  } catch (logErr) {
    console.error("Error logging to file:", logErr);
  }

  // SECURITY: Don't expose internal error details to users
  const isProduction = process.env.NODE_ENV === "production";
  return res.status(500).json({
    isOk: false,
    status: 500,
    error: "Internal Server Error",
    message: isProduction ? "An unexpected error occurred" : err?.message,
  });
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
  console.log(
    `🔒 Security middleware enabled: Helmet, Input Validation, CSRF Protection`,
  );
});
