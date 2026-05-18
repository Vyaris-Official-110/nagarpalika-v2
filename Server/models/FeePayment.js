import mongoose from "mongoose";

const feePaymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, trim: true },
    applicationRefNo: { type: String, required: true, trim: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    gatewayTxnId: { type: String, trim: true, default: "" },
    mode: {
      type: String,
      enum: ["upi", "netbanking", "card", "wallet", "other"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    receiptPath: { type: String, default: "" },
    paidAt: { type: Date },
    tenantId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

feePaymentSchema.index({ paymentId: 1, tenantId: 1 }, { unique: true });

export default mongoose.model("FeePayment", feePaymentSchema);
