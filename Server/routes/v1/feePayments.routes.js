import { Router } from "express";
import {
  listFeePayments,
  getFeePaymentById,
} from "../../controllers/v1/feePayment.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post(
  "/fee-payments/search",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  listFeePayments,
);

router.get(
  "/fee-payments/:id",
  authMiddleware(["SUPER_ADMIN", "ADMIN"]),
  getFeePaymentById,
);

export default router;
