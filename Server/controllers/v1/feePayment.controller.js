import FeePayment from "../../models/FeePayment.js";

export const listFeePayments = async (req, res) => {
  try {
    let { skip = 0, per_page = 10, sorton, sortdir, match, status } = req.body;

    const baseMatch = { tenantId: req.tenantId };
    if (status) baseMatch.status = status;

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
              { paymentId: { $regex: match, $options: "i" } },
              { applicationRefNo: { $regex: match, $options: "i" } },
              { gatewayTxnId: { $regex: match, $options: "i" } },
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

    const list = await FeePayment.aggregate(query);

    return res.status(200).json({ isOk: true, data: list, status: 200 });
  } catch (error) {
    console.error("Error in listFeePayments:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const getFeePaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await FeePayment.findOne({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!payment) {
      return res
        .status(404)
        .json({ isOk: false, message: "Fee payment not found", status: 404 });
    }

    return res.status(200).json({ isOk: true, data: payment, status: 200 });
  } catch (error) {
    console.error("Error in getFeePaymentById:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};
