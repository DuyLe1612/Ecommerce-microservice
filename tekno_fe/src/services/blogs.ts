import { API_BASE_URL } from "@/lib/apiConfig";
import { Blog, BlogDetail } from "@/type/blog";
import { get,post, postForm, put, patch, del, API_BASE } from "@/lib/api";

// client side
export async function getBlogsRecent(count:number): Promise<Blog[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog/recent?count=${count}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // optional: tránh cache khi SSR
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Lấy danh sách blog recent thất bại!");
    }

    // ⬇️ Trả về đúng kiểu Category[]
    const result = await res.json();

    // Trả về chỉ phần data là Category[]
    return result.data as Blog[];

  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function getBlogsList(page: number = 1, pageSize: number = 12) {
  try {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    const res = await fetch(`${API_BASE_URL}/blog?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Lấy danh sách blog thất bại!");
    }

    const json = await res.json();
    // Backend: { success, data: { data: Blog[], totalRecords, totalPages, page, pageSize } }
    const payload = json?.data ?? json;
    return {
      data: (payload?.data ?? []) as Blog[],
      totalRecords: payload?.totalRecords ?? 0,
      totalPages: payload?.totalPages ?? 1,
      page: payload?.page ?? page,
      pageSize: payload?.pageSize ?? pageSize,
    };
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    throw error;
  }
}

export async function getBlogDetail(slug: string): Promise<BlogDetail> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog/${slug}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch product detail: ${res.status}`);
    }

    const result = await res.json();

    if (!result.success || !result.data) {
      throw new Error(result.message || "Invalid API response");
    }

    return result.data as BlogDetail;
  } catch (error) {
    console.error("Error in getProductDetail:", error);
    throw error;
  }
}

// Admin side

// Get all blogs
export async function getAdminBlogs() {
  try {
    return await get(`${API_BASE}/admin/blog`, { cache: "no-store" });
  } catch (error) {
    console.error("❌ Failed to load admin blogs:", error);
    throw error;
  }
}

// Get blog by ID
export async function getAdminBlog(id: number | string) {
  try {
    return await get(`${API_BASE}/admin/blog/${id}`, { cache: "no-store" });
  } catch (error) {
    console.error("❌ Failed to load admin blog:", error);
    throw error;
  }
}

// Create blog
export async function createAdminBlog(data: any) {
  try {
    return await post(`${API_BASE}/admin/blog`, data);
  } catch (error) {
    console.error("❌ Failed to create blog:", error);
    throw error;
  }
}

// Update blog
export async function updateAdminBlog(id: number | string, data: any) {
  try {
    return await put(`${API_BASE}/admin/blog/${id}`, data);
  } catch (error) {
    console.error("❌ Failed to update blog:", error);
    throw error;
  }
}

// Delete blog
export async function deleteAdminBlog(id: number | string) {
  try {
    return await del(`${API_BASE}/admin/blog/${id}`);
  } catch (error) {
    console.error("❌ Failed to delete blog:", error);
    throw error;
  }
}

// Publish blog
export async function publishBlog(id: number | string) {
  try {
    return await post(`${API_BASE}/admin/blog/${id}/publish`, {});
  } catch (error) {
    console.error("❌ Failed to publish blog:", error);
    throw error;
  }
}

// Unpublish blog (set to draft)
export async function unpublishBlog(id: number | string) {
  try {
    return await post(`${API_BASE}/admin/blog/${id}/unpublish`, {});
  } catch (error) {
    console.error("❌ Failed to unpublish blog:", error);
    throw error;
  }
}