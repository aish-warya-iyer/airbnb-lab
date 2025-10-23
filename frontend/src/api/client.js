// src/api/client.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";
const MOCK_PREFIX  = process.env.REACT_APP_MOCK_PREFIX  || "/mock";

export async function apiGet(path, { mock = false, init } = {}) {
  if (mock) {
    // 1) Try local static file first (served by CRA from /public)
    const localUrl = `${process.env.PUBLIC_URL || ""}/mock${path}.json?cb=${Date.now()}`;
    try {
      const localRes = await fetch(localUrl, { headers: { Accept: "application/json" } });
      if (localRes.ok) {
        console.log("[mock] using local file:", localUrl);
        return localRes.json();
      }
      console.warn("[mock] local file not found -> trying backend");
    } catch (e) {
      console.warn("[mock] local fetch failed -> trying backend:", e?.message);
    }

    // 2) Fallback to backend mock route (if your server exposes it)
    const backendUrl = `${API_BASE_URL}${MOCK_PREFIX}${path}`;
    const res = await fetch(backendUrl, { headers: { Accept: "application/json" }, ...(init || {}) });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} @ ${backendUrl}`);
    console.log("[mock] using backend:", backendUrl);
    return res.json();
  }

  // Non-mock requests go straight to your API base
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, ...(init || {}) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// Keep helper
export const getMock = (path) => apiGet(path, { mock: true });
