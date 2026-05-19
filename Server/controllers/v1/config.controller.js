import SiteConfig from "../../models/SiteConfig.js";

export const getConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const config = await SiteConfig.findOne({ key, tenantId: req.tenantId });
    return res
      .status(200)
      .json({ isOk: true, data: config?.value ?? "", status: 200 });
  } catch (error) {
    console.error("Error in getConfig:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res
        .status(400)
        .json({ isOk: false, message: "value is required", status: 400 });
    }

    await SiteConfig.findOneAndUpdate(
      { key, tenantId: req.tenantId },
      { $set: { value } },
      { upsert: true, new: true },
    );

    return res
      .status(200)
      .json({ isOk: true, message: "Config updated", status: 200 });
  } catch (error) {
    console.error("Error in updateConfig:", error);
    return res
      .status(500)
      .json({ isOk: false, message: "Internal server error", status: 500 });
  }
};
