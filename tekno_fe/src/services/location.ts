

import { API_BASE_URL } from "@/lib/apiConfig";
import { District, Province, Ward } from "@/type/location";

// GET /api/locations/provinces
export async function getProvinces(): Promise<Province[]> {
  const res = await fetch(`${API_BASE_URL}/locations/provinces`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to fetch provinces");
  return (json.data ?? json) as Province[];
}

// GET /api/locations/districts?provinceCode=X
export async function getDistricts(provinceCode: number): Promise<District[]> {
  const res = await fetch(
    `${API_BASE_URL}/locations/districts?provinceCode=${provinceCode}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to fetch districts");
  return (json.data ?? json) as District[];
}

// GET /api/locations/wards?districtCode=X
export async function getWards(districtCode: number): Promise<Ward[]> {
  const res = await fetch(
    `${API_BASE_URL}/locations/wards?districtCode=${districtCode}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to fetch wards");
  return (json.data ?? json) as Ward[];
}