const _GATEWAY = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
export const API_BASE = `${_GATEWAY}/admin/coupons`;


export const voucherApi = {
  // GET ALL
  async getAll() {
    const res = await fetch(API_BASE, { cache: "no-store" });
    return res.json();
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

  // GET STATISTICS
  async getStatistics(id: string) {
    const res = await fetch(`${API_BASE}/${id}/statistics`, { cache: "no-store" });
    return res.json();
  },

  // GET USAGE
  async getUsage(id: string) {
    const res = await fetch(`${API_BASE}/${id}/usage`, { cache: "no-store" });
    return res.json();
  },
};
