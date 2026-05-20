import HelpQuery from "../../models/HelpQuery.js";

export const submitQuery = async (req, res) => {
  try {
    const { name, registrationId, queryCategory, email, mobile, message } =
      req.body;

    if (!name || !queryCategory || !message) {
      return res.status(400).json({
        isOk: false,
        message: "name, queryCategory, and message are required",
        status: 400,
      });
    }

    const query = new HelpQuery({
      name,
      registrationId,
      queryCategory,
      email,
      mobile,
      message,
      tenantId: req.tenantId,
    });

    await query.save();

    return res.status(201).json({
      isOk: true,
      message: "Query submitted successfully",
      status: 201,
    });
  } catch (error) {
    console.error("Error in submitQuery:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const listQueries = async (req, res) => {
  try {
    let { skip = 0, per_page = 10, sorton, sortdir, match, status } = req.body;

    const baseMatch = { tenantId: req.tenantId };
    if (status) baseMatch.status = status;

    let query = [
      { $match: baseMatch },
      {
        $facet: {
          stage1: [{ $group: { _id: null, count: { $sum: 1 } } }],
          stage2: [{ $skip: skip }, { $limit: per_page }],
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
              { name: { $regex: match, $options: "i" } },
              { queryCategory: { $regex: match, $options: "i" } },
              { email: { $regex: match, $options: "i" } },
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

    const list = await HelpQuery.aggregate(query);

    return res.status(200).json({ isOk: true, data: list, status: 200 });
  } catch (error) {
    console.error("Error in listQueries:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const updateQueryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["open", "replied", "closed"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ isOk: false, message: "Invalid status", status: 400 });
    }

    const helpQuery = await HelpQuery.findOne({
      _id: id,
      tenantId: req.tenantId,
    });
    if (!helpQuery) {
      return res
        .status(404)
        .json({ isOk: false, message: "Query not found", status: 404 });
    }

    helpQuery.status = status;
    await helpQuery.save();

    return res
      .status(200)
      .json({ isOk: true, message: "Query status updated", status: 200 });
  } catch (error) {
    console.error("Error in updateQueryStatus:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};
