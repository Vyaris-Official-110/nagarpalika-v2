import Application from "../../models/Application.js";
import { logAudit } from "../../middlewares/auditLog.js";
import xlsx from "xlsx";
import PDFDocument from "pdfkit";

export const listApplications = async (req, res) => {
  try {
    let { skip = 0, per_page = 10, sorton, sortdir, match, status, isDeleted } = req.body;

    const baseMatch = { tenantId: req.tenantId };
    if (status) baseMatch.status = status;
    baseMatch.isDeleted = isDeleted !== undefined && isDeleted !== null ? isDeleted : false;

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
              { registrationId:   { $regex: match, $options: "i" } },
              { advtNo:           { $regex: match, $options: "i" } },
            ],
          },
        },
        ...query,
      ];
    }

    const sortStage = sorton && sortdir
      ? { $sort: { [sorton]: sortdir === "desc" ? -1 : 1 } }
      : { $sort: { createdAt: -1 } };

    query = [sortStage, ...query];

    const list = await Application.aggregate(query);
    return res.status(200).json({ isOk: true, data: list, status: 200 });
  } catch (error) {
    console.error("Error in listApplications:", error);
    return res.status(500).json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false });
    if (!application) {
      return res.status(404).json({ isOk: false, message: "Application not found", status: 404 });
    }

    return res.status(200).json({ isOk: true, data: application, status: 200 });
  } catch (error) {
    console.error("Error in getApplicationById:", error);
    return res.status(500).json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["draft", "submitted", "fee_pending", "fee_paid", "shortlisted", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ isOk: false, message: "Invalid status value", status: 400 });
    }

    const application = await Application.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false });
    if (!application) {
      return res.status(404).json({ isOk: false, message: "Application not found", status: 404 });
    }

    application.status = status;
    await application.save();
    logAudit(req, "application.status_update", "application", id, { status });

    return res.status(200).json({ isOk: true, message: "Application status updated", status: 200 });
  } catch (error) {
    console.error("Error in updateApplicationStatus:", error);
    return res.status(500).json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const exportApplications = async (req, res) => {
  try {
    const { format = "csv", advtNo, status } = req.body;

    const validFormats = ["csv", "excel", "pdf"];
    if (!validFormats.includes(format)) {
      return res.status(400).json({ isOk: false, message: "Invalid format. Use csv, excel, or pdf", status: 400 });
    }

    const filter = { tenantId: req.tenantId, isDeleted: false };
    if (advtNo) filter.advtNo = advtNo;
    if (status) filter.status = status;

    const applications = await Application.find(filter).sort({ createdAt: -1 }).lean();

    logAudit(req, "application.export", "application", "", { format, count: applications.length, advtNo, status });

    const rows = applications.map((a) => ({
      "Application Ref No": a.applicationRefNo ?? "",
      "Registration ID":    a.registrationId ?? "",
      "Advt No":            a.advtNo ?? "",
      "Status":             a.status ?? "",
      "Submitted At":       a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-IN") : "",
    }));

    if (format === "csv") {
      const header = Object.keys(rows[0] ?? { "Application Ref No": "", "Registration ID": "", "Advt No": "", "Status": "", "Submitted At": "" });
      const csvLines = [
        header.join(","),
        ...rows.map((r) => header.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")),
      ];
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="applications.csv"`);
      return res.send(csvLines.join("\r\n"));
    }

    if (format === "excel") {
      const ws = xlsx.utils.json_to_sheet(rows);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "Applications");
      const buf = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="applications.xlsx"`);
      return res.send(buf);
    }

    if (format === "pdf") {
      const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="applications.pdf"`);
      doc.pipe(res);

      doc.fontSize(14).text("Applications Export", { align: "center" }).moveDown(0.5);
      doc.fontSize(9);

      const cols = ["Application Ref No", "Registration ID", "Advt No", "Status", "Submitted At"];
      const colW = [140, 110, 110, 80, 90];
      let x = 40;
      cols.forEach((h, i) => {
        doc.font("Helvetica-Bold").text(h, x, doc.y, { width: colW[i], continued: i < cols.length - 1 });
        x += colW[i];
      });
      doc.font("Helvetica").moveDown(0.4);

      rows.forEach((r) => {
        if (doc.y > 520) doc.addPage();
        x = 40;
        const y = doc.y;
        cols.forEach((h, i) => {
          doc.text(String(r[h] ?? ""), x, y, { width: colW[i] });
          x += colW[i];
        });
        doc.moveDown(0.3);
      });

      doc.end();
      return;
    }
  } catch (error) {
    console.error("Error in exportApplications:", error);
    if (!res.headersSent) {
      return res.status(500).json({ isOk: false, message: "Internal server error", status: 500 });
    }
  }
};
