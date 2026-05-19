import api from "./index";
import { ENDPOINTS } from "./endpoints";

export const createAdvertisement = (data) =>
    api.post(ENDPOINTS.ADVERTISEMENTS.BASE, data);

export const getAdvertisementById = (id) =>
    api.get(ENDPOINTS.ADVERTISEMENTS.BY_ID(id));

export const updateAdvertisement = (id, data) =>
    api.put(ENDPOINTS.ADVERTISEMENTS.BY_ID(id), data);

export const publishAdvertisement = (id) =>
    api.patch(ENDPOINTS.ADVERTISEMENTS.PUBLISH(id));

export const closeAdvertisement = (id) =>
    api.patch(ENDPOINTS.ADVERTISEMENTS.CLOSE(id));

export const archiveAdvertisement = (id) =>
    api.patch(ENDPOINTS.ADVERTISEMENTS.ARCHIVE(id));

export const deleteAdvertisement = (id) =>
    api.delete(ENDPOINTS.ADVERTISEMENTS.BY_ID(id));

export const searchAdvertisements = (params) =>
    api.post(ENDPOINTS.ADVERTISEMENTS.SEARCH, params);

export const uploadAdvertisementPdf = (id, file) => {
    const fd = new FormData();
    fd.append('pdf', file);
    return api.post(ENDPOINTS.ADVERTISEMENTS.UPLOAD_PDF(id), fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export default {
    createAdvertisement,
    getAdvertisementById,
    updateAdvertisement,
    publishAdvertisement,
    closeAdvertisement,
    deleteAdvertisement,
    searchAdvertisements,
};
