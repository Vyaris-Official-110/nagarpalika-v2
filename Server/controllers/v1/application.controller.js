import Application from "../../models/Application.js";

export const listApplications = async (req, res) => {
  try {
    let {
      skip = 0,
      per_page = 10,
      sorton,
      sortdir,
      match,
      status,
      isDeleted,
    } = req.body;

    const baseMatch = { tenantId: req.tenantId };
    if (status) baseMatch.status = status;
    baseMatch.isDeleted =
      isDeleted !== undefined && isDeleted !== null ? isDeleted : false;

    let query = [
      { $match: baseMatch },
      {
        $facet: {
          stage1: [{ $group: { _id: null, count: { $sum: 1 } } }],
          stage2: [{ $skip: Number(skip) }, { $limit: Number(per_page) }],
        },
      },
      { $unwind: "$stage1" },
      { $project: { count: "$stage1.count", data: "$stage2" } },
    ];

    if (match) {
      query = [
        {
          $match: {
            $or: [
              { applicationRefNo: { $regex: match, $options: "i" } },
              { registrationId: { $regex: match, $options: "i" } },
              { advtNo: { $regex: match, $options: "i" } },
            ],
          },
        },
        ...query,
      ];
    }

    const sortStage =
      sorton && sortdir
        ? { $sort: { [sorton]: sortdir === "desc" ? -1 : 1 } }
        : { $sort: { createdAt: -1 } };

    query = [sortStage, ...query];

    const list = await Application.aggregate(query);

    return res.status(200).json({ isOk: true, data: list, status: 200 });
  } catch (error) {
    console.error("Error in listApplications:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findOne({
      _id: id,
      tenantId: req.tenantId,
      isDeleted: false,
    });

    if (!application) {
      return res
        .status(404)
        .json({ isOk: false, message: "Application not found", status: 404 });
    }

    return res.status(200).json({ isOk: true, data: application, status: 200 });
  } catch (error) {
    console.error("Error in getApplicationById:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = [
      "draft",
      "submitted",
      "fee_pending",
      "fee_paid",
      "shortlisted",
      "rejected",
    ];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid status value", status: 400 });
    }

    const application = await Application.findOne({
      _id: id,
      tenantId: req.tenantId,
      isDeleted: false,
    });

    if (!application) {
      return res
        .status(404)
        .json({ isOk: false, message: "Application not found", status: 404 });
    }

    application.status = status;
    await application.save();

    return res
      .status(200)
      .json({ isOk: true, message: "Application status updated", status: 200 });
  } catch (error) {
    console.error("Error in updateApplicationStatus:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};
