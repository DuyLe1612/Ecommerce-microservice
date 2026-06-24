/* src/lib/productsImageApi.ts */
import { postForm, put, del, post, API_BASE } from "./api";

const BASE = `${API_BASE}/admin/products`;

type UploadResult = {
  id: number;
  imageUrl?: string;
  [k: string]: any;
};

export async function uploadImage(file: File, productId: number, isPrimary: boolean = false): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("productId", String(productId));
  fd.append("file", file);
  fd.append("isPrimary", String(isPrimary));

  const json = await postForm(`${BASE}/images`, fd);
  return json.data ?? json;
}

export async function updateImageMeta(imageId: number, payload: { isPrimary?: boolean; sortOrder?: number; [k: string]: any }) {
  const json = await put(`${BASE}/images/${imageId}`, payload);
  return json?.data ?? json;
}

export async function deleteImage(imageId: number) {
  await del(`${BASE}/images/${imageId}`);
  return true;
}

export async function reorderImages(productId: number, imageIds: number[]) {
  const payload = { productId, imageIds };
  const json = await post(`${BASE}/images/reorder`, payload);
  return json?.data ?? json;
}

export async function deleteVariant(variantId: number) {
  await del(`${BASE}/variants/${variantId}`);
  return true;
}