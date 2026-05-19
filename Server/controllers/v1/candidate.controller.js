import Candidate from "../../models/Candidate.js";
import { Parser } from "json2csv";

export const listCandidates = async (req, res) => {
  try {
    let {
      skip = 0,
      per_page = 10,
      sorton,
      sortdir,
      match,
      isActive,
    } = req.body;

    const baseMatch = { tenantId: req.tenantId };
    if (isActive !== undefined && isActive !== null)
      baseMatch.isActive = isActive;

    let query = [
      { $match: baseMatch },
      {
        $facet: {
          stage1: [{ $group: { _id: null, count: { $sum: 1 } } }],
          stage2: [
            { $skip: Number(skip) },
            { $limit: Number(per_page) },
            { $project: { aadhaarHash: 0 } },
          ],
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
              { registrationId: { $regex: match, $options: "i" } },
              { name: { $regex: match, $options: "i" } },
              { mobile: { $regex: match, $options: "i" } },
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

    const list = await Candidate.aggregate(query);

    return res.status(200).json({ isOk: true, data: list, status: 200 });
  } catch (error) {
    console.error("Error in listCandidates:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findOne(
      { _id: id, tenantId: req.tenantId },
      { aadhaarHash: 0 },
    );

    if (!candidate) {
      return res
        .status(404)
        .json({ isOk: false, message: "Candidate not found", status: 404 });
    }

    return res.status(200).json({ isOk: true, data: candidate, status: 200 });
  } catch (error) {
    console.error("Error in getCandidateById:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

// CSV / Excel export — PRD §5.8.4
export const exportCandidates = async (req, res) => {
  try {
    const { format = "csv", category, registrationCompleted } = req.query;

    const filter = { tenantId: req.tenantId };
    if (category) filter.category = category;
    if (registrationCompleted !== undefined)
      filter.registrationCompleted = registrationCompleted === "true";

    const candidates = await Candidate.find(filter, {
      registrationId: 1,
      name: 1,
      fatherName: 1,
      dob: 1,
      gender: 1,
      category: 1,
      mobile: 1,
      email: 1,
      registrationCompleted: 1,
      createdAt: 1,
    }).lean();

    const fields = [
      "registrationId",
      "name",
      "fatherName",
      "dob",
      "gender",
      "category",
      "mobile",
      "email",
      "registrationCompleted",
      "createdAt",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(candidates);

    const filename = `candidates_${Date.now()}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error("Error in exportCandidates:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const toggleCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findOne(
      { _id: id, tenantId: req.tenantId },
      { aadhaarHash: 0 },
    );

    if (!candidate) {
      return res
        .status(404)
        .json({ isOk: false, message: "Candidate not found", status: 404 });
    }

    candidate.isActive = !candidate.isActive;
    await candidate.save();

    return res.status(200).json({
      isOk: true,
      message: `Candidate ${candidate.isActive ? "activated" : "deactivated"}`,
      status: 200,
    });
  } catch (error) {
    console.error("Error in toggleCandidateStatus:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};
