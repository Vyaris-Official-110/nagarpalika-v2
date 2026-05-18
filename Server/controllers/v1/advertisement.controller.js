import Advertisement from "../../models/Advertisement.js";

export const createAdvertisement = async (req, res) => {
  try {
    const {
      advtNo,
      postTitle,
      departmentId,
      postClass,
      payScale,
      vacancies,
      applicationFee,
      startDate,
      endDate,
    } = req.body;

    const existing = await Advertisement.findOne({
      advtNo,
      tenantId: req.tenantId,
    });
    if (existing) {
      return res
        .status(400)
        .json({
          isOk: false,
          message: "Advertisement number already exists",
          status: 400,
        });
    }

    const advertisement = new Advertisement({
      advtNo,
      postTitle,
      departmentId,
      postClass,
      payScale,
      vacancies,
      applicationFee,
      startDate,
      endDate,
      tenantId: req.tenantId,
    });

    await advertisement.save();

    return res
      .status(201)
      .json({
        isOk: true,
        message: "Advertisement created successfully",
        status: 201,
      });
  } catch (error) {
    console.error("Error in createAdvertisement:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const updateAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      postTitle,
      departmentId,
      postClass,
      payScale,
      vacancies,
      applicationFee,
      startDate,
      endDate,
      pdfPath,
    } = req.body;

    const advertisement = await Advertisement.findOne({
      _id: id,
      tenantId: req.tenantId,
      isDeleted: false,
    });
    if (!advertisement) {
      return res
        .status(404)
        .json({ isOk: false, message: "Advertisement not found", status: 404 });
    }

    if (advertisement.status === "published") {
      return res
        .status(400)
        .json({
          isOk: false,
          message: "Cannot edit a published advertisement",
          status: 400,
        });
    }

    Object.assign(advertisement, {
      postTitle: postTitle ?? advertisement.postTitle,
      departmentId: departmentId ?? advertisement.departmentId,
      postClass: postClass ?? advertisement.postClass,
      payScale: payScale ?? advertisement.payScale,
      vacancies: vacancies ?? advertisement.vacancies,
      applicationFee: applicationFee ?? advertisement.applicationFee,
      startDate: startDate ?? advertisement.startDate,
      endDate: endDate ?? advertisement.endDate,
      pdfPath: pdfPath ?? advertisement.pdfPath,
    });

    await advertisement.save();

    return res
      .status(200)
      .json({
        isOk: true,
        message: "Advertisement updated successfully",
        status: 200,
      });
  } catch (error) {
    console.error("Error in updateAdvertisement:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const publishAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findOne({
      _id: id,
      tenantId: req.tenantId,
      isDeleted: false,
    });
    if (!advertisement) {
      return res
        .status(404)
        .json({ isOk: false, message: "Advertisement not found", status: 404 });
    }

    if (advertisement.status === "published") {
      return res
        .status(400)
        .json({
          isOk: false,
          message: "Advertisement already published",
          status: 400,
        });
    }

    advertisement.status = "published";
    await advertisement.save();

    return res
      .status(200)
      .json({ isOk: true, message: "Advertisement published", status: 200 });
  } catch (error) {
    console.error("Error in publishAdvertisement:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const closeAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findOne({
      _id: id,
      tenantId: req.tenantId,
      isDeleted: false,
    });
    if (!advertisement) {
      return res
        .status(404)
        .json({ isOk: false, message: "Advertisement not found", status: 404 });
    }

    advertisement.status = "closed";
    await advertisement.save();

    return res
      .status(200)
      .json({ isOk: true, message: "Advertisement closed", status: 200 });
  } catch (error) {
    console.error("Error in closeAdvertisement:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const deleteAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findOne({
      _id: id,
      tenantId: req.tenantId,
      isDeleted: false,
    });
    if (!advertisement) {
      return res
        .status(404)
        .json({ isOk: false, message: "Advertisement not found", status: 404 });
    }

    if (advertisement.status === "published") {
      return res
        .status(400)
        .json({
          isOk: false,
          message: "Cannot delete a published advertisement",
          status: 400,
        });
    }

    advertisement.isDeleted = true;
    await advertisement.save();

    return res
      .status(200)
      .json({
        isOk: true,
        message: "Advertisement deleted successfully",
        status: 200,
      });
  } catch (error) {
    console.error("Error in deleteAdvertisement:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const getAdvertisementById = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findOne({
      _id: id,
      tenantId: req.tenantId,
      isDeleted: false,
    }).populate("departmentId", "departmentName departmentCode");

    if (!advertisement) {
      return res
        .status(404)
        .json({ isOk: false, message: "Advertisement not found", status: 404 });
    }

    return res
      .status(200)
      .json({ isOk: true, data: advertisement, status: 200 });
  } catch (error) {
    console.error("Error in getAdvertisementById:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const listAdvertisements = async (req, res) => {
  try {
    const advertisements = await Advertisement.find({
      tenantId: req.tenantId,
      status: "published",
      isDeleted: false,
    })
      .populate("departmentId", "departmentName departmentCode")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ isOk: true, data: advertisements, status: 200 });
  } catch (error) {
    console.error("Error in listAdvertisements:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const listAdvertisementsByParams = async (req, res) => {
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
        $lookup: {
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: { path: "$department", preserveNullAndEmpty: true } },
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
              { advtNo: { $regex: match, $options: "i" } },
              { postTitle: { $regex: match, $options: "i" } },
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

    const list = await Advertisement.aggregate(query);

    return res.status(200).json({ isOk: true, data: list, status: 200 });
  } catch (error) {
    console.error("Error in listAdvertisementsByParams:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};
