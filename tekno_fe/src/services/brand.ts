import { get, postForm, put, del, API_BASE } from "@/lib/api";

export async function getBrandList() {
  try {
    return await get(`${API_BASE}/brands/list`, { cache: "no-store" });
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function createBrand(fd: FormData) {
  try {
    return await postForm(`${API_BASE}/admin/brands/create`, fd);
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function updateBrand(fd: FormData) {
  try {
    return await put(`${API_BASE}/admin/brands/update`, fd);
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function deleteBrand(id: string) {
  try {
    const fd = new FormData();
    fd.append("Id", id);
    return await del(`${API_BASE}/admin/brands/delete`, {
    body: JSON.stringify({ Id: id }),
    headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}