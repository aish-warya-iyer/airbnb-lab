// src/api/properties.js
import { apiGet } from "./client";

/** List all mock properties */
export const getMockProperties = () => apiGet("/properties", { mock: true });

/** Get one property by id (tries /properties/:id first; falls back to filtering list) */
export const getMockPropertyById = async (id) => {
  try {
    // if your mock backend supports /mock/properties/:id
    return await apiGet(`/properties/${id}`, { mock: true });
  } catch {
    // fallback if only /properties list exists
    const list = await getMockProperties();
    return list.find(
      (p) => String(p.id) === String(id) || String(p._id) === String(id)
    );
  }
};
