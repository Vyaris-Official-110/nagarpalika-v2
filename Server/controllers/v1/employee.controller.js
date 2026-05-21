import EmployeeModels from "../../models/Employee.js";
import CompanyMaster from "../../models/CompanyMaster.js";
import RoleMaster from "../../models/RoleMaster.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { generateSecret, generateURI, verify as totpVerify } from "otplib";
import { sendEmail } from "../../services/email.service.js";

export const createEmployee = async (req, res) => {
  try {
    const {
      employeeName,
      departmentId,
      roleId,
      emailOffice,
      mobileNumber,
      countryId,
      stateId,
      cityId,
      address,
      password,
      isActive,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const existingEmployee = await EmployeeModels.findOne({
      emailOffice: emailOffice,
    });

    if (existingEmployee) {
      return res
        .status(400)
        .json({ isOk: false, message: "Employee already exists" });
    }

    const employee = new EmployeeModels({
      employeeName,
      departmentId,
      roleId,
      emailOffice,
      mobileNumber,
      countryId,
      stateId,
      cityId,
      address,
      password: hashedPassword,
      isActive,
    });

    await employee.save();

    return res.status(201).json({
      isOk: true,
      message: "Employee created successfully",
      status: 201,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      isOk: false,
      message: error.message,
      status: 500,
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const {
      employeeName,
      departmentId,
      roleId,
      emailOffice,
      mobileNumber,
      countryId,
      stateId,
      cityId,
      address,
      isActive,
    } = req.body;

    const employee = await EmployeeModels.findById(employeeId);

    if (!employee) {
      return res.status(400).json({
        isOk: false,
        message: "Employee not found",
        status: 400,
      });
    }

    const existingEmployee = await EmployeeModels.findOne({
      emailOffice: emailOffice,
      _id: { $ne: employeeId },
    });

    if (existingEmployee) {
      return res.status(400).json({
        isOk: false,
        message: "Email already exists",
        status: 400,
      });
    }

    employee.employeeName = employeeName;
    employee.departmentId = departmentId;
    employee.roleId = roleId;
    employee.emailOffice = emailOffice;
    employee.mobileNumber = mobileNumber;
    employee.countryId = countryId;
    employee.stateId = stateId;
    employee.cityId = cityId;
    employee.address = address;
    employee.isActive = isActive;

    await employee.save();

    return res.status(200).json({
      isOk: true,
      message: "Employee updated successfully",
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      isOk: false,
      message: error.message,
      status: 500,
    });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await EmployeeModels.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        isOk: false,
        message: "Employee not found",
        status: 404,
      });
    }

    await EmployeeModels.findByIdAndDelete(employeeId).exec();

    return res.status(200).json({
      isOk: true,
      message: "Employee deleted successfully",
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      isOk: false,
      message: error.message,
      status: 500,
    });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await EmployeeModels.findById(employeeId)
      .populate("departmentId")
      .populate("countryId")
      .populate("stateId")
      .populate("cityId")
      .populate("roleId");

    if (!employee) {
      return res.status(404).json({
        isOk: false,
        message: "Employee not found",
        status: 404,
      });
    }

    return res.status(200).json({
      isOk: true,
      data: employee,
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      isOk: false,
      message: error.message,
      status: 500,
    });
  }
};

export const listAllEmployees = async (req, res) => {
  try {
    const employees = await EmployeeModels.find({
      isActive: true,
    })
      .populate("departmentId")
      .populate("countryId")
      .populate("stateId")
      .populate("cityId")
      .populate("roleId");

    return res.status(200).json({
      isOk: true,
      data: employees,
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      isOk: false,
      message: error.message,
      status: 500,
    });
  }
};

export const listEmployeesByParams = async (req, res) => {
  try {
    let { skip, per_page, sorton, sortdir, match, isActive } = req.body;

    // Build the initial match condition
    let matchCondition = {};
    if (isActive !== undefined && isActive !== null && isActive !== "") {
      matchCondition.isActive = isActive;
    }

    let query = [
      {
        $match: matchCondition,
      },
      {
        $lookup: {
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: {
          path: "$department",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "rolemasters",
          localField: "roleId",
          foreignField: "_id",
          as: "role",
        },
      },
      {
        $unwind: {
          path: "$role",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $facet: {
          stage1: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          stage2: [{ $skip: skip }, { $limit: per_page }],
        },
      },
      {
        $unwind: "$stage1",
      },
      {
        $project: {
          count: "$stage1.count",
          data: "$stage2",
        },
      },
    ];

    if (match) {
      let searchConditions = {
        $or: [
          { employeeName: { $regex: match, $options: "i" } },
          { emailOffice: { $regex: match, $options: "i" } },
          { mobileNumber: { $regex: match, $options: "i" } },
          {
            "department.departmentName": {
              $regex: match,
              $options: "i",
            },
          },
        ],
      };

      if (mongoose.Types.ObjectId.isValid(match)) {
        searchConditions.$or.push(
          { departmentId: new mongoose.Types.ObjectId(match) },
          { roleId: new mongoose.Types.ObjectId(match) },
        );
      }

      query = [{ $match: searchConditions }].concat(query);
    }

    if (sorton && sortdir) {
      let sort = {};
      sort[sorton] = sortdir === "desc" ? -1 : 1;
      query = [{ $sort: sort }].concat(query);
    } else {
      query = [{ $sort: { createdAt: -1 } }].concat(query);
    }

    const list = await EmployeeModels.aggregate(query);

    return res.status(200).json({
      data: list,
      status: 200,
    });
  } catch (error) {
    console.error("Error in listEmployeesByParams:", error);
    return res.status(500).json({
      isOk: false,
      message: error.message,
      status: 500,
    });
  }
};

export const listAllEmployeesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    console.log(departmentId);

    const employees = await EmployeeModels.find({
      departmentId,
      isActive: true,
    });

    return res.status(200).json({
      isOk: true,
      data: employees,
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      isOk: false,
      message: error.message,
      status: 500,
    });
  }
};

const ADMIN_MAX_ATTEMPTS = 3;
const ADMIN_LOCKOUT_MINUTES = 30;

export const loginEmployee = async (req, res) => {
  try {
    const { email, password, totpToken } = req.body;

    const employee = await EmployeeModels.findOne({ emailOffice: email })
      .populate("departmentId")
      .populate("countryId")
      .populate("stateId")
      .populate("cityId")
      .populate("roleId")
      .exec();

    if (!employee) {
      return res
        .status(401)
        .json({ isOk: false, message: "Invalid credentials", status: 401 });
    }

    // IP whitelist check — PRD §5.8.1, §9.1
    if (employee.ipWhitelist && employee.ipWhitelist.length > 0) {
      const clientIp = req.ip || req.connection?.remoteAddress || "";
      const normalised = clientIp.replace("::ffff:", "");
      if (!employee.ipWhitelist.includes(normalised)) {
        return res
          .status(403)
          .json({ isOk: false, message: "Access denied", status: 403 });
      }
    }

    // Brute-force lockout — PRD §9.1 (3 attempts → 30 min for admin)
    if (employee.lockoutUntil && employee.lockoutUntil > new Date()) {
      return res.status(429).json({
        isOk: false,
        message: "Account locked. Try again later.",
        status: 429,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      employee.loginAttempts = (employee.loginAttempts || 0) + 1;
      if (employee.loginAttempts >= ADMIN_MAX_ATTEMPTS) {
        employee.lockoutUntil = new Date(
          Date.now() + ADMIN_LOCKOUT_MINUTES * 60 * 1000,
        );
        employee.loginAttempts = 0;
        // PRD §9.11 — alert Super Admins on lockout (fire-and-forget)
        RoleMaster.findOne({ roleName: "SUPER_ADMIN" })
          .then((superAdminRole) => {
            if (!superAdminRole) return;
            return EmployeeModels.find({
              roleId: superAdminRole._id,
              isDeleted: false,
            }).select("emailOffice");
          })
          .then((admins) => {
            if (!admins?.length) return;
            const lockedUntil = new Date(
              Date.now() + ADMIN_LOCKOUT_MINUTES * 60 * 1000,
            ).toLocaleString("en-IN");
            return Promise.all(
              admins.map((a) =>
                sendEmail({
                  to: a.emailOffice,
                  subject: "Admin Account Locked",
                  text: `Admin account ${employee.emailOffice} locked after ${ADMIN_MAX_ATTEMPTS} failed login attempts. Locked until ${lockedUntil}.`,
                }),
              ),
            );
          })
          .catch((err) =>
            console.error("lockout alert failed:", err?.message),
          );
      }
      await employee.save();
      return res
        .status(401)
        .json({ isOk: false, message: "Invalid credentials", status: 401 });
    }

    // 2FA — PRD §9.1, §5.8.1
    if (employee.twoFactorEnabled) {
      if (!totpToken) {
        return res.status(200).json({
          isOk: true,
          requiresTwoFactor: true,
          message: "Enter your authenticator app code",
          status: 200,
        });
      }
      if (employee.twoFactorLastUsedToken === totpToken) {
        return res.status(401).json({
          isOk: false,
          message: "TOTP code already used. Wait for next code.",
          status: 401,
        });
      }
      const { valid } = await totpVerify({
        token: totpToken,
        type: "totp",
        secret: employee.twoFactorSecret,
      });
      if (!valid) {
        return res
          .status(401)
          .json({ isOk: false, message: "Invalid 2FA code", status: 401 });
      }
      employee.twoFactorLastUsedToken = totpToken;
    }

    // Reset lockout counters on successful login
    employee.loginAttempts = 0;
    employee.lockoutUntil = undefined;
    await employee.save();

    req.session.user = {
      id: employee._id.toString(),
      role: employee.roleId?.roleName || "EMPLOYEE",
      email: employee.emailOffice,
      name: employee.employeeName,
      departmentId: employee.departmentId?._id?.toString(),
    };

    return res.status(200).json({
      isOk: true,
      message: "Login successful",
      data: employee,
      status: 200,
    });
  } catch (error) {
    console.error("loginEmployee error:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const setupTwoFactor = async (req, res) => {
  try {
    const isAdmin = req.user.role === "ADMIN";
    const user = isAdmin
      ? await CompanyMaster.findById(req.user.id)
      : await EmployeeModels.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ isOk: false, message: "User not found", status: 404 });
    }

    const account = isAdmin ? user.email : user.emailOffice;
    const secret = generateSecret();
    const otpauth = generateURI({
      secret,
      account,
      issuer: "NagarPalika Admin",
      type: "totp",
    });

    user.twoFactorSecret = secret;
    await user.save();

    return res
      .status(200)
      .json({ isOk: true, data: { otpauth, secret }, status: 200 });
  } catch (error) {
    console.error("setupTwoFactor error:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const resetTwoFactor = async (req, res) => {
  try {
    const isAdmin = req.user.role === "ADMIN";
    const user = isAdmin
      ? await CompanyMaster.findById(req.user.id)
      : await EmployeeModels.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ isOk: false, message: "User not found", status: 404 });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = "";
    user.twoFactorLastUsedToken = "";
    await user.save();

    return res.status(200).json({
      isOk: true,
      message: "2FA reset. Set up again to re-enroll.",
      status: 200,
    });
  } catch (error) {
    console.error("resetTwoFactor error:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const enableTwoFactor = async (req, res) => {
  try {
    const { totpToken } = req.body;
    const isAdmin = req.user.role === "ADMIN";
    const user = isAdmin
      ? await CompanyMaster.findById(req.user.id)
      : await EmployeeModels.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ isOk: false, message: "User not found", status: 404 });
    }

    if (!user.twoFactorSecret) {
      return res
        .status(400)
        .json({ isOk: false, message: "Run setup first", status: 400 });
    }

    const { valid } = await totpVerify({
      token: totpToken,
      type: "totp",
      secret: user.twoFactorSecret,
    });
    if (!valid) {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid code", status: 400 });
    }

    user.twoFactorEnabled = true;
    await user.save();

    return res
      .status(200)
      .json({ isOk: true, message: "2FA enabled", status: 200 });
  } catch (error) {
    console.error("enableTwoFactor error:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // The user ID is available in req.user.id from the auth middleware
    const userId = req.user.id;
    let role = null;

    if (!userId) {
      return res.status(400).json({
        isOk: false,
        message: "User ID not found in request",
      });
    }

    let user = null;
    user = await EmployeeModels.findById(userId);
    if (user) {
      role = "EMPLOYEE";
    }

    if (!user) {
      user = await CompanyMaster.findById(userId);
      if (user) {
        role = "ADMIN";
      }
    }

    // DOCTOR role removed — recruitment portal uses ADMIN / EMPLOYEE / DEPT_ADMIN only

    if (!user) {
      return res.status(404).json({
        isOk: false,
        message: "User not found",
      });
    }

    const dataToSend = {
      _id: user._id,
      employeeName: user.employeeName || user.doctorName,
      emailOffice: user.emailOffice || user.email,
      role: role,
      isActive: user.isActive,
      departmentId: user.departmentId,
      roleId: user.roleId,
      twoFactorEnabled: user.twoFactorEnabled ?? false,
    };

    if (role === "DOCTOR") {
      dataToSend.doctorName = user.doctorName;
    }

    const company = await CompanyMaster.findOne({ isSuperAdmin: false });

    if (role === "EMPLOYEE" || role === "DOCTOR") {
      dataToSend.companyName = company ? company.companyName : "";
    }

    // Return essential user information
    return res.status(200).json({
      isOk: true,
      message: "User details retrieved successfully",
      data: dataToSend,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({
      isOk: false,
      message: error.message || "Error retrieving user details",
    });
  }
};
export const logoutUser = async (req, res) => {
  try {
    // Destroy the express session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({
          isOk: false,
          message: "Logout failed",
          status: 500,
        });
      }

      // Clear the session cookie
      res.clearCookie("sessionId");

      return res.status(200).json({
        isOk: true,
        message: "Logged out successfully",
        status: 200,
      });
    });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({
      isOk: false,
      message: "Logout failed",
      status: 500,
    });
  }
};

/**
 * Verify session - lightweight endpoint to check if session is valid
 * Returns only the user role, no sensitive data
 */
export const verifySession = async (req, res) => {
  return res.status(200).json({
    isOk: true,
    data: {
      role: req.user.role,
    },
  });
};

export const resetPassword = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { password } = req.body;

    const employee = await EmployeeModels.findById(employeeId);

    if (!employee) {
      return res.status(400).json({
        isOk: false,
        message: "Employee not found",
        status: 400,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    employee.password = hashedPassword;

    await employee.save();

    return res.status(200).json({
      isOk: true,
      message: "Password reset successfully",
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      isOk: false,
      message: error.message,
      status: 500,
    });
  }
};
