import { API_BASE_URL } from "@/lib/apiConfig";
import { Category, CategoryAttribute } from "@/type/categories";
import { get, post, put, putForm, del, API_BASE } from "@/lib/api";

export interface AttributeValue {
  id: number;
  attributeId: number;
  value: string;
}

export interface AttributeValuesResponse {
  id: number;
  name: string;
  inputType: string;
  isGlobal: boolean;
  categoryId: number | null;
  categoryName: string | null;
  values: AttributeValue[];
}

export interface CreateAttributeRequest {
  name: string;
  inputType: string;
  isGlobal: boolean;
  categoryId: number;
  initialValues: string[];
}

export async function getCategoriesList(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/categories/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // optional: tránh cache khi SSR
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Lấy danh sách thất bại!");
    }

    // ⬇️ Trả về đúng kiểu Category[]
    const result = await res.json();

    // Trả về chỉ phần data là Category[]
    return result.data as Category[];

  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function getCategoriesTree(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/tree`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // optional: tránh cache khi SSR
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Lấy danh sách thất bại!");
    }

    // ⬇️ Trả về đúng kiểu Category[]
    const result = await res.json();

    // Trả về chỉ phần data là Category[]
    return result.data as Category[];

  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function createCategory(data: { name: string; slug?: string; parentId?: number | null } | FormData) {
  try {
    return await post(`${API_BASE}/admin/categories`, data);
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function updateCategory(id: number, data?: { name?: string; slug?: string; parentId?: number | null } | FormData) {
  try {
    return await put(`${API_BASE}/admin/categories/${id}`, data);
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function deleteCategory(id: number) {
  try {
    return await del(`${API_BASE}/admin/categories/${id}`);
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function getCategoryAttributesForFilter(categorySlug: string): Promise<CategoryAttribute[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/${categorySlug}/attributes`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Lấy attributes thất bại!");
    }

    const result = await res.json();
    return result.data as CategoryAttribute[];
  } catch (error) {
    console.error("❌ Lỗi khi gọi API attributes:", error);
    throw error;
  }
}


export async function getCategoryAttributes(categoryId: number) {
  const res = await fetch(
    `${API_BASE}/admin/categories/${categoryId}/attributes`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Lấy attributes thất bại!");
  }

  const result = await res.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid attributes response");
  }

  return result.data; // ✅ TRẢ VỀ ARRAY
}

export async function createCategoryAttribute(categoryId: number, name: string, inputType: string = "text") {
  return post(
    `${API_BASE}/admin/categories/attributes`,
    {
        categoryId,
        name,
    }
  );
}

export async function updateCategoryAttribute(
  attributeId: number,
  name: string,
  inputType: string = "text"
) {
  if (!attributeId) {
    throw new Error("attributeId is required");
  }

  // Gửi JSON thay vì FormData
  return put(
    `${API_BASE}/admin/categories/attributes/${attributeId}`,
    {
      name: name,
    }
  );
}

export async function deleteCategoryAttribute(attributeId: number) {
  try {
    return await del(`${API_BASE}/admin/categories/attributes/${attributeId}`, {
      body: JSON.stringify({ AttributeId: attributeId }),
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function getCategoryAttributeValues(
  attributeId: number
): Promise<AttributeValuesResponse> {
  try {
    const res = await fetch(
      `${API_BASE}/admin/categories/attributes/${attributeId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Lấy attribute values thất bại!");
    }
    const result = await res.json();
    return result.data as AttributeValuesResponse;
  } catch (error) {
    console.error("❌ Lỗi khi gọi API attribute values:", error);
    throw error;
  }
}

export async function addCategoryAttributeValue(attributeId: number, value: string) {
  try {
    const body = { AttributeId: attributeId, Value: value };
    return await post(`${API_BASE}/admin/categories/attributes/values`, body);
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function deleteCategoryAttributeValue(valueId: number, value: string) {
  try {
    const body = { ValueId: valueId, Value: value };
    return await del(`${API_BASE}/admin/categories/attributes/values/${valueId}`, {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function updateCategoryAttributeValues(valueId: number, values: string[]) {
  try {
    const body = { ValueId: valueId, Values: values };
    return await put(`${API_BASE}/admin/categories/attributes/values/${valueId}`, body);
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function createAttribute(data: CreateAttributeRequest) {
  try {
    return await post(`${API_BASE}/admin/categories/attributes`, data);
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function getGlobalAttributes() {
  try {
    const res = await fetch(`${API_BASE}/admin/categories/attributes/global`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Lấy global attributes thất bại!");
    }

    const result = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}