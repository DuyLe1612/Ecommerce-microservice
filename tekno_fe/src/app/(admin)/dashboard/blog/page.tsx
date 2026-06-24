"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Trash2, Edit2, FileText, FilePlus, X } from "lucide-react";
import {
  getAdminBlogs,
  getAdminBlog,
  createAdminBlog,
  updateAdminBlog,
  deleteAdminBlog,
  publishBlog,
  unpublishBlog,
} from "@/services/blogs";

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);

  // Search + Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    featuredImage: null as File | null,
    tags: [] as string[],
    relatedProductIds: [] as number[],
    publishImmediately: false,
  });

  // For tags input (comma separated)
  const [tagsInput, setTagsInput] = useState("");
  const [productIdsInput, setProductIdsInput] = useState("");

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const res = await getAdminBlogs();
      const list = res?.data?.data || res?.data || [];
      setBlogs(list);
    } catch (err) {
      console.error("Failed to load blogs:", err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!form.title || !form.slug || !form.content) {
        alert("Please fill required fields: Title, Slug, Content");
        return;
      }

      if (form.title.length < 10 || form.title.length > 200) {
        alert("Title must be between 10 and 200 characters");
        return;
      }

      const payload: any = {
        title: form.title,
        slug: form.slug,
        summary: form.summary,
        content: form.content,
        publishImmediately: form.publishImmediately,
        tags: form.tags,
        productIds: form.relatedProductIds.join(","),
        authorId: 1, // Optional: Set default author ID or fetch from context
      };

      if (form.featuredImage) {
        try {
          const { uploadGenericImage } = await import("@/services/categories");
          const uploadRes = await uploadGenericImage(form.featuredImage);
          if (uploadRes?.success && uploadRes?.data?.url) {
            payload.featuredImageUrl = uploadRes.data.url;
          }
        } catch (uploadErr) {
          console.error("Failed to upload blog image:", uploadErr);
          alert("Upload image failed, continuing with other updates.");
        }
      }

      await createAdminBlog(payload);
      alert("Blog created successfully!");

      await loadBlogs();
      setOpenCreate(false);
      resetForm();
    } catch (err) {
      console.error("Create failed:", err);
      alert(`Create failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const openEditModal = async (blog: any) => {
    try {
      const detail = await getAdminBlog(blog.id);
      const data = detail?.data || detail;

      setSelectedBlog(data);
      setForm({
        title: data.title,
        slug: data.slug,
        summary: data.summary || "",
        content: data.content,
        featuredImage: null,
        tags: Array.isArray(data.tags) ? data.tags : [],
        relatedProductIds: Array.isArray(data.products) 
          ? data.products.map((p: any) => p.id) 
          : [],
        publishImmediately: false,
      });

      // Set input fields - KHÔNG điền sẵn tags
      setTagsInput("");
      setProductIdsInput(
        Array.isArray(data.products) 
          ? data.products.map((p: any) => p.id).join(", ") 
          : ""
      );

      setOpenEdit(true);
    } catch (err) {
      console.error("Failed to load blog detail:", err);
      alert("Failed to load blog details");
    }
  };

const handleUpdate = async () => {
  try {
    if (!selectedBlog) return;

    if (!form.title || !form.slug || !form.content) {
      alert("Please fill required fields: Title, Slug, Content");
      return;
    }

    const payload: any = {
      title: form.title,
      slug: form.slug,
      summary: form.summary,
      content: form.content,
      publishImmediately: form.publishImmediately,
      tags: form.tags,
      productIds: form.relatedProductIds.join(","),
      authorId: 1, // Optional: Set default author ID
    };

    if (form.featuredImage) {
      try {
        const { uploadGenericImage } = await import("@/services/categories");
        const uploadRes = await uploadGenericImage(form.featuredImage);
        if (uploadRes?.success && uploadRes?.data?.url) {
          payload.featuredImageUrl = uploadRes.data.url;
        }
      } catch (uploadErr) {
        console.error("Failed to upload blog image:", uploadErr);
        alert("Upload image failed, continuing with other updates.");
      }
    }

    await updateAdminBlog(selectedBlog.id, payload);
    alert("Blog updated successfully!");

    await loadBlogs();
    
    const updatedBlog = await getAdminBlog(selectedBlog.id);
    const updatedData = updatedBlog?.data || updatedBlog;
    setSelectedBlog(updatedData);
    
    setOpenEdit(false);
    resetForm();
  } catch (err) {
    console.error("Update failed:", err);
    alert(`Update failed: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
};

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      await deleteAdminBlog(id);
      alert("Blog deleted successfully!");
      await loadBlogs();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete blog");
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await publishBlog(id);
      alert("Blog published successfully!");
      await loadBlogs();
    } catch (err) {
      console.error("Publish failed:", err);
      alert("Failed to publish blog");
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await unpublishBlog(id);
      alert("Blog unpublished successfully!");
      await loadBlogs();
    } catch (err) {
      console.error("Unpublish failed:", err);
      alert("Failed to unpublish blog");
    }
  };

  const handleViewDetail = async (blog: any) => {
    try {
      const detail = await getAdminBlog(blog.id);
      const data = detail?.data || detail;
      setSelectedBlog(data);
      setOpenDetail(true);
    } catch (err) {
      console.error("Failed to load detail:", err);
      setSelectedBlog(blog);
      setOpenDetail(true);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      summary: "",
      content: "",
      featuredImage: null,
      tags: [],
      relatedProductIds: [],
      publishImmediately: false,
    });
    setTagsInput("");
    setProductIdsInput("");
    setSelectedBlog(null);
  };

  // Parse tags from input - CHỈ thêm tag mới, không ghi đè
const handleTagsInputChange = (value: string) => {
  setTagsInput(value);

  const tags = value
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);

  setForm({ ...form, tags });
};


const handleRemoveTag = (idx: number) => {
  // Lấy tag muốn xóa
  const tagToRemove = form.tags[idx];
  
  // Nếu là tag cũ (đã từ DB), không cho xóa
  const oldTags = selectedBlog ? (Array.isArray(selectedBlog.tags) ? selectedBlog.tags : []) : [];
  
  
  // Nếu là tag mới, cho xóa
  const newTags = form.tags.filter((_, i) => i !== idx);
  setForm({ ...form, tags: newTags });
  setTagsInput("");
};

  // Parse product IDs from input
  const handleProductIdsInputChange = (value: string) => {
    setProductIdsInput(value);
    const idsArray = value
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));
    setForm({ ...form, relatedProductIds: idsArray });
  };

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchSearch =
        blog.title?.toLowerCase().includes(search.toLowerCase()) ||
        blog.slug?.toLowerCase().includes(search.toLowerCase()) ||
        blog.authorName?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "All" || blog.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [blogs, search, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Blog Management</h2>
        <Button onClick={() => setOpenCreate(true)}>+ Create Blog</Button>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by title, author, or slug..."
          className="border p-2 rounded w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Loading blogs...</p>
        </div>
      ) : blogs.length === 0 ? (
        <p className="text-gray-500">No blogs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white shadow rounded">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2">ID</th>
                <th className="p-2">Image</th>
                <th>Title</th>
                <th>Author</th>
                <th>Published Date</th>
                <th>Status</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog) => (
                <tr key={blog.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-mono text-xs text-gray-600">{blog.id}</td>
                  <td className="p-2">
                    {blog.featuredImageUrl ? (
                      <img
                        src={blog.featuredImageUrl}
                        alt={blog.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <FileText size={16} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="p-2">
                    <div className="font-medium">{blog.title}</div>
                    <div className="text-xs text-gray-500">{blog.slug}</div>
                  </td>
                  <td className="p-2">{blog.authorName || "N/A"}</td>
                  <td className="p-2 text-xs">
                    {blog.publishedAt
                      ? new Date(blog.publishedAt).toLocaleDateString("vi-VN")
                      : "Not published"}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        blog.status
                      )}`}
                    >
                      {blog.status}
                    </span>
                  </td>
                  <td className="p-2">{blog.viewCount || 0}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(blog)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => openEditModal(blog)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>

                      {blog.status === "Draft" ? (
                        <button
                          onClick={() => handlePublish(blog.id)}
                          className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                          title="Publish"
                        >
                          <FilePlus size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnpublish(blog.id)}
                          className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                          title="Unpublish"
                        >
                          <FileText size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {openCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create Blog</h3>
              <button
                onClick={() => {
                  setOpenCreate(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Blog title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="blog-slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Summary</label>
                <textarea
                  className="border rounded p-2 w-full"
                  rows={3}
                  placeholder="Brief summary..."
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="border rounded p-2 w-full"
                  rows={10}
                  placeholder="Blog content (HTML supported)..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Featured Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, featuredImage: e.target.files?.[0] || null })
                  }
                />
                {form.featuredImage && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">{form.featuredImage.name}</p>
                    <img
                      src={URL.createObjectURL(form.featuredImage)}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tags (comma-separated)
                </label>
                <Input
                  placeholder="review, iphone, apple, flagship"
                  value={tagsInput}
                  onChange={(e) => handleTagsInputChange(e.target.value)}
                />
                {form.tags.length > 0 && (
  <div className="mt-2 flex flex-wrap gap-2">
    {form.tags.map((tag, idx) => (
      <span
        key={idx}
        className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
      >
        {tag}
        <button
          type="button"
          onClick={() => handleRemoveTag(idx)}
          className="hover:bg-blue-200 rounded-full p-0.5"
          title="Remove tag"
        >
          <X className="w-3 h-3" />
        </button>
      </span>
    ))}
  </div>
)}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Related Product IDs (comma-separated)
                </label>
                <Input
                  placeholder="10, 61, 80"
                  value={productIdsInput}
                  onChange={(e) => handleProductIdsInputChange(e.target.value)}
                />
                {form.relatedProductIds.length > 0 && (
                  <p className="mt-1 text-xs text-gray-600">
                    Products: {form.relatedProductIds.join(", ")}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publishImmediately"
                  checked={form.publishImmediately}
                  onChange={(e) =>
                    setForm({ ...form, publishImmediately: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="publishImmediately" className="text-sm font-medium">
                  Publish immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenCreate(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create Blog</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {openEdit && selectedBlog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Blog</h3>
              <button
                onClick={() => {
                  setOpenEdit(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Blog title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

<div>
  <label className="block text-sm font-medium mb-1">
    Slug <span className="text-red-500">*</span>
  </label>
  <Input
    placeholder="blog-slug"
    value={form.slug}
    readOnly
    disabled
    className="bg-gray-100 cursor-not-allowed"
  />
  <p className="text-xs text-gray-500 mt-1">Slug cannot be changed</p>
</div>

              <div>
                <label className="block text-sm font-medium mb-1">Summary</label>
                <textarea
                  className="border rounded p-2 w-full"
                  rows={3}
                  placeholder="Brief summary..."
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="border rounded p-2 w-full"
                  rows={10}
                  placeholder="Blog content (HTML supported)..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>

              {selectedBlog.featuredImageUrl && !form.featuredImage && (
                <div>
                  <label className="block text-sm font-medium mb-1">Current Image</label>
                  <img
                    src={selectedBlog.featuredImageUrl}
                    alt="Current"
                    className="w-full h-40 object-cover rounded"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Update Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, featuredImage: e.target.files?.[0] || null })
                  }
                />
                {form.featuredImage && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">{form.featuredImage.name}</p>
                    <img
                      src={URL.createObjectURL(form.featuredImage)}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tags (comma-separated)
                </label>
                <Input
                  placeholder="review, iphone, apple, flagship"
                  value={tagsInput}
                  onChange={(e) => handleTagsInputChange(e.target.value)}
                />
                {form.tags.length > 0 && (
  <div className="mt-2 flex flex-wrap gap-2">
    {form.tags.map((tag, idx) => (
      <span
        key={idx}
        className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
      >
        {tag}
        <button
          type="button"
          onClick={() => handleRemoveTag(idx)}
          className="hover:bg-blue-200 rounded-full p-0.5"
          title="Remove tag"
        >
          <X className="w-3 h-3" />
        </button>
      </span>
    ))}
  </div>
)}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Related Product IDs (comma-separated)
                </label>
                <Input
                  placeholder="10, 61, 80"
                  value={productIdsInput}
                  onChange={(e) => handleProductIdsInputChange(e.target.value)}
                />
                {form.relatedProductIds.length > 0 && (
                  <p className="mt-1 text-xs text-gray-600">
                    Products: {form.relatedProductIds.join(", ")}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publishImmediatelyEdit"
                  checked={form.publishImmediately}
                  onChange={(e) =>
                    setForm({ ...form, publishImmediately: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="publishImmediatelyEdit" className="text-sm font-medium">
                  Publish immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenEdit(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdate}>Update Blog</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {openDetail && selectedBlog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Blog Details</h3>
              <button
                onClick={() => setOpenDetail(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {selectedBlog.featuredImageUrl && (
              <img
                src={selectedBlog.featuredImageUrl}
                alt={selectedBlog.title}
                className="w-full h-64 object-cover rounded mb-4"
              />
            )}

            <div className="space-y-4">
              <div>
                <h4 className="text-2xl font-bold">{selectedBlog.title}</h4>
                <p className="text-sm text-gray-600">Slug: {selectedBlog.slug}</p>
              </div>

              <div className="flex items-center gap-4 text-sm flex-wrap">
                {selectedBlog.authorName && (
                  <span>
                    <strong>Author:</strong> {selectedBlog.authorName}
                  </span>
                )}
                <span>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                      selectedBlog.status
                    )}`}
                  >
                    {selectedBlog.status}
                  </span>
                </span>
                <span>
                  <strong>Views:</strong> {selectedBlog.viewCount || 0}
                </span>
              </div>

              {selectedBlog.publishedAt && (
                <p className="text-sm text-gray-600">
                  <strong>Published:</strong>{" "}
                  {new Date(selectedBlog.publishedAt).toLocaleString("vi-VN")}
                </p>
              )}

              {selectedBlog.summary && (
                <div>
                  <h5 className="font-semibold mb-2">Summary</h5>
                  <p className="text-gray-700">{selectedBlog.summary}</p>
                </div>
              )}

              <div>
                <h5 className="font-semibold mb-2">Content</h5>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              </div>

              {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-2">Tags</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedBlog.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedBlog.products && selectedBlog.products.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-2">Related Products</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedBlog.products.map((product: any) => (
                      <div
                        key={product.id}
                        className="flex gap-3 p-3 border rounded hover:bg-gray-50"
                      >
                        <img
                          src={product.primaryImagePath}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-600">
                            {product.brandName} • {product.categoryName}
                          </p>
                          <p className="text-sm font-bold text-green-600 mt-1">
                            {product.finalPrice.toLocaleString()}đ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setOpenDetail(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setOpenDetail(false);
                    openEditModal(selectedBlog);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}