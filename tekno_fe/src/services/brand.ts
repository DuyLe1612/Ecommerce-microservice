import { get, post, put, del, postForm, API_BASE } from "@/lib/api";

export async function uploadBrandLogo(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return postForm(`${API_BASE}/cloudinary/generic?folder=brand/logo`, formData);
}

export async function getBrandList() {
  try {
    return await get(`${API_BASE}/brands/list`, { cache: "no-store" });
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function createBrand(payload: any) {
  try {
    return await post(`${API_BASE}/admin/brands/create`, payload);
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function updateBrand(id: number | string, payload: any) {
  try {
    return await put(`${API_BASE}/admin/brands/${id}`, payload);
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function deleteBrand(id: string | number) {
  try {
    return await del(`${API_BASE}/admin/brands/delete/${id}`);
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}