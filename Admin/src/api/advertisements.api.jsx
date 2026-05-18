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

export const deleteAdvertisement = (id) =>
    api.delete(ENDPOINTS.ADVERTISEMENTS.BY_ID(id));

export const searchAdvertisements = (params) =>
    api.post(ENDPOINTS.ADVERTISEMENTS.SEARCH, params);

export default {
    createAdvertisement,
    getAdvertisementById,
    updateAdvertisement,
    publishAdvertisement,
    closeAdvertisement,
    deleteAdvertisement,
    searchAdvertisements,
};
