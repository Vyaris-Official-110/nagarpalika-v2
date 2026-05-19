import { Router } from "express";
import {
  listFeePayments,
  getFeePaymentById,
  feeReconciliationReport,
  manualVerifyFee,
} from "../../controllers/v1/feePayment.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post(
  "/fee-payments/search",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  listFeePayments,
);

router.get(
  "/fee-payments/reconciliation",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  feeReconciliationReport,
);

router.get(
  "/fee-payments/:id",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  getFeePaymentById,
);

// Manual fee verification — PRD §5.8.6
router.patch(
  "/fee-payments/:id/verify",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  manualVerifyFee,
);

export default router;
