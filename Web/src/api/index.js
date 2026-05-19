import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    ...(import.meta.env.VITE_TENANT_ID && { "x-tenant-id": import.meta.env.VITE_TENANT_ID }),
  },
});

export const getAdvertisements = () => api.get("/api/v1/advertisements");

export const getNotices = (type) =>
  api.get("/api/v1/notices", { params: type ? { type } : {} });

export const submitHelpQuery = (data) => api.post("/api/v1/help/query", data);

export default api;
