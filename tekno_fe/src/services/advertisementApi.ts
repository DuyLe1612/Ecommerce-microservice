import { API_BASE_URL } from "@/lib/apiConfig";
import { Advertisement, AdvertisementPosition } from "@/type/advertisement";
import { ApiResponse } from "@/type/share";

const _GATEWAY = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
export const API_BASE = `${_GATEWAY}/admin/advertisements`;

export const advertisementApi = {
// GET ALL
async getAll(params?: { pageSize?: number; page?: number }) {
  const query = new URLSearchParams();
  if (params?.pageSize) query.append("PageSize", String(params.pageSize));
  if (params?.page) query.append("Page", String(params.page));
  
  const url = `${_GATEWAY}/admin/advertisements${query.toString() ? `?${query.toString()}` : ""}`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return await res.json();
},

  // GET BY ID
  async getById(id: string) {
    const res = await fetch(`${API_BASE}/${id}`);
    return res.json();
  },

  // CREATE
  async create(data: any) {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // UPDATE
  async update(id: string, data: any) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // DELETE
  async delete(id: string) {
    return fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  },

  // ACTIVATE
  async activate(id: string) {
    return fetch(`${API_BASE}/${id}/activate`, { method: "PATCH" });
  },

  // DEACTIVATE
  async deactivate(id: string) {
    return fetch(`${API_BASE}/${id}/deactivate`, { method: "PATCH" });
  },
};


// src/services/advertisements.ts


export async function getAdvertisementsByPosition(
  position: AdvertisementPosition,
  token?: string
): Promise<Advertisement[]> {
  const res = await fetch(
    `${API_BASE_URL}/advertisements/position/${position}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      // Server Component nên dùng:
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch advertisements");
  }

  const json: ApiResponse<Advertisement[]> = await res.json();

  if (!json.success) {
    throw new Error(json.message || "API Error");
  }

  return json.data;
}
