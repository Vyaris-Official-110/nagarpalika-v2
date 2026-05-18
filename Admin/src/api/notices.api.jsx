import api from "./index";
import { ENDPOINTS } from "./endpoints";

export const createNotice = (data) =>
    api.post(ENDPOINTS.NOTICES.BASE, data);

export const getNoticeById = (id) =>
    api.get(ENDPOINTS.NOTICES.BY_ID(id));

export const publishNotice = (id) =>
    api.patch(ENDPOINTS.NOTICES.PUBLISH(id));

export const deleteNotice = (id) =>
    api.delete(ENDPOINTS.NOTICES.BY_ID(id));

export const searchNotices = (params) =>
    api.post(ENDPOINTS.NOTICES.SEARCH, params);

export default { createNotice, getNoticeById, publishNotice, deleteNotice, searchNotices };
