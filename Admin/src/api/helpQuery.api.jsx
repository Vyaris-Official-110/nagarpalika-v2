import api from "./index";
import { ENDPOINTS } from "./endpoints";

export const searchHelpQueries = (params) =>
    api.post(ENDPOINTS.HELP_QUERIES.SEARCH, params);

export const updateQueryStatus = (id, status) =>
    api.patch(ENDPOINTS.HELP_QUERIES.STATUS(id), { status });

export default { searchHelpQueries, updateQueryStatus };
