import api from "./index";
import { ENDPOINTS } from "./endpoints";

export const searchCandidates = (params) =>
    api.post(ENDPOINTS.CANDIDATES.SEARCH, params);

export const getCandidateById = (id) =>
    api.get(ENDPOINTS.CANDIDATES.BY_ID(id));

export const toggleCandidateStatus = (id) =>
    api.patch(ENDPOINTS.CANDIDATES.STATUS(id));

export default { searchCandidates, getCandidateById, toggleCandidateStatus };
