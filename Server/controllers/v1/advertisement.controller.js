import Advertisement from "../../models/Advertisement.js";
import path from "path";
import fs from "fs";

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
      return res.status(400).json({
        isOk: false,
        message: "Advertisement number already exists",
        status: 400,
      });
    }

    // DEPT_ADMIN scope — PRD §9.3: DEPT_ADMIN can only create advts for own department
    const effectiveDeptId = req.scopedDepartmentId ?? departmentId;
    if (
      req.scopedDepartmentId &&
      req.scopedDepartmentId.toString() !== departmentId?.toString()
    ) {
      return res
        .status(403)
        .json({
          isOk: false,
          message: "You can only create advertisements for your department",
          status: 403,
        });
    }

    const advertisement = new Advertisement({
      advtNo,
      postTitle,
      departmentId: effectiveDeptId,
      postClass,
      payScale,
      vacancies,
      applicationFee,
      startDate,
      endDate,
      tenantId: req.tenantId,
    });

    await advertisement.save();

    return res.status(201).json({
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

    const baseFilter = { _id: id, tenantId: req.tenantId, isDeleted: false };
    // DEPT_ADMIN scope — PRD §9.3
    if (req.scopedDepartmentId)
      baseFilter.departmentId = req.scopedDepartmentId;

    const advertisement = await Advertisement.findOne(baseFilter);
    if (!advertisement) {
      return res
        .status(404)
        .json({ isOk: false, message: "Advertisement not found", status: 404 });
    }

    if (advertisement.status === "published") {
      return res.status(400).json({
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

    return res.status(200).json({
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
      return res.status(400).json({
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

export const archiveAdvertisement = async (req, res) => {
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

    if (advertisement.status !== "closed") {
      return res.status(400).json({
        isOk: false,
        message: "Only closed advertisements can be archived",
        status: 400,
      });
    }

    advertisement.status = "archived";
    await advertisement.save();

    return res
      .status(200)
      .json({ isOk: true, message: "Advertisement archived", status: 200 });
  } catch (error) {
    console.error("Error in archiveAdvertisement:", error);
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
      return res.status(400).json({
        isOk: false,
        message: "Cannot delete a published advertisement",
        status: 400,
      });
    }

    advertisement.isDeleted = true;
    await advertisement.save();

    return res.status(200).json({
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

export const uploadAdvertisementPdf = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res
        .status(400)
        .json({ isOk: false, message: "No PDF uploaded", status: 400 });
    }

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

    // Remove old PDF if present
    if (advertisement.pdfPath) {
      const oldPath = path.join(
        global.__basedir,
        "uploads",
        "advertisements",
        advertisement.pdfPath,
      );
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    advertisement.pdfPath = req.file.filename;
    await advertisement.save();

    return res
      .status(200)
      .json({
        isOk: true,
        message: "PDF uploaded",
        pdfPath: req.file.filename,
        status: 200,
      });
  } catch (error) {
    console.error("Error in uploadAdvertisementPdf:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const serveAdvertisementPdf = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findOne({
      _id: id,
      tenantId: req.tenantId,
      isDeleted: false,
      status: "published",
    });

    if (!advertisement || !advertisement.pdfPath) {
      return res
        .status(404)
        .json({ isOk: false, message: "PDF not found", status: 404 });
    }

    const filePath = path.join(
      global.__basedir,
      "uploads",
      "advertisements",
      advertisement.pdfPath,
    );
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ isOk: false, message: "PDF file not found", status: 404 });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${advertisement.advtNo}.pdf"`,
    );
    return res.sendFile(filePath);
  } catch (error) {
    console.error("Error in serveAdvertisementPdf:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const bulkExportZip = async (req, res) => {
  // Stub — requires P4 Application data; returns 501 until P4 is complete
  return res.status(501).json({
    isOk: false,
    message:
      "Bulk ZIP export available after P4 Application module is complete",
    status: 501,
  });
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
      { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
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
