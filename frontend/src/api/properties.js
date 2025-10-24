// src/api/properties.js
import { apiGet } from "./client";

/** Real API (unwraps the backend's { properties } / { property } shape) */
export const propertiesApi = {
  getProperties: async () => {
    const res = await apiGet("/properties");
    return res?.properties ?? res;
  },
  getPropertyById: async (id) => {
    const res = await apiGet(`/properties/${id}`);
    return res?.property ?? res;
  },
};

/** --- Optional mocks you can keep for local/offline dev --- */
export const getMockProperties = () => apiGet("/properties", { mock: true });

export const getMockPropertyById = async (id) => {
  try {
    return await apiGet(`/properties/${id}`, { mock: true });
  } catch {
    const list = await getMockProperties();
    return list.find(
      (p) => String(p.id) === String(id) || String(p._id) === String(id)
    );
  }
};
