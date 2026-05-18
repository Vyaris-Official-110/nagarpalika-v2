import Notice from "../../models/Notice.js";

export const listNotices = async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;
    const filter = {
      tenantId: req.tenantId,
      status: "published",
      isDeleted: false,
    };
    if (type) filter.type = type;

    const notices = await Notice.find(filter)
      .sort({ publishedAt: -1 })
      .limit(Number(limit));

    return res.status(200).json({ isOk: true, data: notices, status: 200 });
  } catch (error) {
    console.error("Error in listNotices:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findOne({
      _id: id,
      tenantId: req.tenantId,
      isDeleted: false,
    });

    if (!notice) {
      return res
        .status(404)
        .json({ isOk: false, message: "Notice not found", status: 404 });
    }

    return res.status(200).json({ isOk: true, data: notice, status: 200 });
  } catch (error) {
    console.error("Error in getNoticeById:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const createNotice = async (req, res) => {
  try {
    const { title, type, refNo, publishedAt, expiresAt, pdfPath } = req.body;

    const notice = new Notice({
      title,
      type,
      refNo,
      publishedAt,
      expiresAt,
      pdfPath,
      status: "draft",
      tenantId: req.tenantId,
    });

    await notice.save();

    return res
      .status(201)
      .json({
        isOk: true,
        message: "Notice created successfully",
        status: 201,
      });
  } catch (error) {
    console.error("Error in createNotice:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const publishNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findOne({
      _id: id,
      tenantId: req.tenantId,
      isDeleted: false,
    });

    if (!notice) {
      return res
        .status(404)
        .json({ isOk: false, message: "Notice not found", status: 404 });
    }

    if (notice.status === "published") {
      return res
        .status(400)
        .json({
          isOk: false,
          message: "Notice already published",
          status: 400,
        });
    }

    notice.status = "published";
    await notice.save();

    return res
      .status(200)
      .json({ isOk: true, message: "Notice published", status: 200 });
  } catch (error) {
    console.error("Error in publishNotice:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findOne({
      _id: id,
      tenantId: req.tenantId,
      isDeleted: false,
    });

    if (!notice) {
      return res
        .status(404)
        .json({ isOk: false, message: "Notice not found", status: 404 });
    }

    notice.isDeleted = true;
    await notice.save();

    return res
      .status(200)
      .json({
        isOk: true,
        message: "Notice deleted successfully",
        status: 200,
      });
  } catch (error) {
    console.error("Error in deleteNotice:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const listNoticesByParams = async (req, res) => {
  try {
    let {
      skip = 0,
      per_page = 10,
      sorton,
      sortdir,
      match,
      status,
      type,
      isDeleted,
    } = req.body;

    const baseMatch = { tenantId: req.tenantId };
    if (status) baseMatch.status = status;
    if (type) baseMatch.type = type;
    baseMatch.isDeleted =
      isDeleted !== undefined && isDeleted !== null ? isDeleted : false;

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
              { title: { $regex: match, $options: "i" } },
              { refNo: { $regex: match, $options: "i" } },
            ],
          },
        },
        ...query,
      ];
    }

    const sortStage =
      sorton && sortdir
        ? { $sort: { [sorton]: sortdir === "desc" ? -1 : 1 } }
        : { $sort: { publishedAt: -1 } };

    query = [sortStage, ...query];

    const list = await Notice.aggregate(query);

    return res.status(200).json({ isOk: true, data: list, status: 200 });
  } catch (error) {
    console.error("Error in listNoticesByParams:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};
