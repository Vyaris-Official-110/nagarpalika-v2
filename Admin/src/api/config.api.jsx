import api from "./index";
import { ENDPOINTS } from "./endpoints";

export const getConfig = (key) =>
    api.get(ENDPOINTS.CONFIG.BY_KEY(key));

export const updateConfig = (key, value) =>
    api.patch(ENDPOINTS.CONFIG.BY_KEY(key), { value });
