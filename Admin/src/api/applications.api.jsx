import api from "./index";
import { ENDPOINTS } from "./endpoints";

export const searchApplications = (params) =>
    api.post(ENDPOINTS.APPLICATIONS.SEARCH, params);

export const getApplicationById = (id) =>
    api.get(ENDPOINTS.APPLICATIONS.BY_ID(id));

export const updateApplicationStatus = (id, status) =>
    api.patch(ENDPOINTS.APPLICATIONS.STATUS(id), { status });

export default { searchApplications, getApplicationById, updateApplicationStatus };
