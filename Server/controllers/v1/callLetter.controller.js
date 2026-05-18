import CallLetter from "../../models/CallLetter.js";

export const listCallLetters = async (req, res) => {
  try {
    let {
      skip = 0,
      per_page = 10,
      sorton,
      sortdir,
      match,
      enabled,
    } = req.body;

    const baseMatch = { tenantId: req.tenantId };
    if (enabled !== undefined && enabled !== null) baseMatch.enabled = enabled;

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
              { registrationId: { $regex: match, $options: "i" } },
              { advtNo: { $regex: match, $options: "i" } },
              { rollNumber: { $regex: match, $options: "i" } },
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

    const list = await CallLetter.aggregate(query);

    return res.status(200).json({ isOk: true, data: list, status: 200 });
  } catch (error) {
    console.error("Error in listCallLetters:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const getCallLetterById = async (req, res) => {
  try {
    const { id } = req.params;

    const callLetter = await CallLetter.findOne({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!callLetter) {
      return res
        .status(404)
        .json({ isOk: false, message: "Call letter not found", status: 404 });
    }

    return res
      .status(200)
      .json({ isOk: true, data: callLetter, status: 200 });
  } catch (error) {
    console.error("Error in getCallLetterById:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const updateCallLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled, examDate, venue, availableFrom, rollNumber } = req.body;

    const callLetter = await CallLetter.findOne({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!callLetter) {
      return res
        .status(404)
        .json({ isOk: false, message: "Call letter not found", status: 404 });
    }

    if (enabled !== undefined) callLetter.enabled = enabled;
    if (examDate !== undefined) callLetter.examDate = examDate;
    if (venue !== undefined) callLetter.venue = venue;
    if (availableFrom !== undefined) callLetter.availableFrom = availableFrom;
    if (rollNumber !== undefined) callLetter.rollNumber = rollNumber;

    await callLetter.save();

    return res
      .status(200)
      .json({ isOk: true, message: "Call letter updated", status: 200 });
  } catch (error) {
    console.error("Error in updateCallLetter:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};
