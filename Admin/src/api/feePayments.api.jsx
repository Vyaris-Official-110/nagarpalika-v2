import api from "./index";
import { ENDPOINTS } from "./endpoints";

export const searchFeePayments = (params) =>
    api.post(ENDPOINTS.FEE_PAYMENTS.SEARCH, params);

export const getFeePaymentById = (id) =>
    api.get(ENDPOINTS.FEE_PAYMENTS.BY_ID(id));

export default { searchFeePayments, getFeePaymentById };
