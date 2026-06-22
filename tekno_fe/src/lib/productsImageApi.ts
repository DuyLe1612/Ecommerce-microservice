/* src/lib/productsImageApi.ts */
import { API_BASE_URL } from "./apiConfig";
const BASE = `${API_BASE_URL}/admin/products`;

type UploadResult = {
  id: number;
  imageUrl?: string;
  [k: string]: any;
};

async function handleJsonResponse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    // not JSON
    return text;
  }
}

export async function uploadImage(file: File, productId: number, isPrimary: boolean = false): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("productId", String(productId));
  fd.append("file", file);
  fd.append("isPrimary", String(isPrimary));

  const res = await fetch(`${BASE}/images`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const body = await handleJsonResponse(res);
    throw new Error(`Upload failed: ${JSON.stringify(body)}`);
  }

  const json = await res.json();
  // expected { data: { id: ..., ... } } or similar
  return json.data ?? json;
}

export async function updateImageMeta(imageId: number, payload: { isPrimary?: boolean; sortOrder?: number; [k: string]: any }) {
  const res = await fetch(`${BASE}/images/${imageId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await handleJsonResponse(res);
    throw new Error(`Update image ${imageId} failed: ${JSON.stringify(body)}`);
  }

  const json = await res.json().catch(() => null);
  return json?.data ?? json;
}

export async function deleteImage(imageId: number) {
  const res = await fetch(`${BASE}/images/${imageId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const body = await handleJsonResponse(res);
    throw new Error(`Delete image ${imageId} failed: ${JSON.stringify(body)}`);
  }

  return true;
}

export async function reorderImages(productId: number, imageIds: number[]) {
  const payload = { productId, imageIds };
  const res = await fetch(`${BASE}/images/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await handleJsonResponse(res);
    throw new Error(`Reorder images failed: ${JSON.stringify(body)}`);
  }

  const json = await res.json().catch(() => null);
  return json?.data ?? json;
}

export async function deleteVariant(variantId: number) {
  const res = await fetch(`${BASE}/variants/${variantId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const body = await handleJsonResponse(res);
    throw new Error(`Delete variant ${variantId} failed: ${JSON.stringify(body)}`);
  }

  return true;
}