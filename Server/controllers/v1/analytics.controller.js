import Advertisement from "../../models/Advertisement.js";
import Candidate from "../../models/Candidate.js";
import Application from "../../models/Application.js";
import FeePayment from "../../models/FeePayment.js";

export const getDashboardStats = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const [
      activeAdvertisements,
      totalCandidates,
      totalApplications,
      feeAgg,
    ] = await Promise.all([
      Advertisement.countDocuments({ tenantId, status: "published", isDeleted: false }),
      Candidate.countDocuments({ tenantId, isActive: true }),
      Application.countDocuments({ tenantId, isDeleted: false }),
      FeePayment.aggregate([
        { $match: { tenantId, status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalFeesCollected = feeAgg[0]?.total ?? 0;

    return res.status(200).json({
      isOk: true,
      data: {
        activeAdvertisements,
        totalCandidates,
        totalApplications,
        totalFeesCollected,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};
