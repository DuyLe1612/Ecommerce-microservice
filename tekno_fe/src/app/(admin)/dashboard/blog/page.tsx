"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("slug", form.slug);
      fd.append("summary", form.summary);
      fd.append("content", form.content);
      fd.append("publishImmediately", String(form.publishImmediately));

      if (form.featuredImage) {
        fd.append("featuredImage", form.featuredImage);
      }

      // Tags as array
      if (form.tags.length > 0) {
        form.tags.forEach((tag) => {
          fd.append("tags[]", tag);
        });
      }

      // Related Product IDs as array
      if (form.relatedProductIds.length > 0) {
        form.relatedProductIds.forEach((id) => {
          fd.append("relatedProductIds[]", String(id));
        });
      }

      await createAdminBlog(fd);
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

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("slug", form.slug);
    fd.append("summary", form.summary);
    fd.append("content", form.content);
    fd.append("publishImmediately", String(form.publishImmediately));
    
    // ✅ FIX: Gửi tags như array (tags[]), không phải JSON string
    if (form.tags.length > 0) {
      form.tags.forEach((tag) => {
        fd.append("tags[]", tag);
      });
    }

    if (form.featuredImage) {
      fd.append("featuredImage", form.featuredImage);
    }

    // ✅ Gửi relatedProductIds như array
    if (form.relatedProductIds.length > 0) {
      form.relatedProductIds.forEach((id) => {
        fd.append("relatedProductIds[]", String(id));
      });
    }

    await updateAdminBlog(selectedBlog.id, fd);
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

      const matchStatus = statusFilter === "All" || blog.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [blogs, search, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "bg-green-500/10 text-green-500 border border-green-500/20";
      case "draft":
        return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
    }
  };

  const paginatedBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBlogs.slice(startIndex, endIndex);
  }, [filteredBlogs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);

  const getVisiblePages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, -1, totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, -1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages);
      }
    }
    return pages;
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
          className="border border-white/10 bg-black/20 text-gray-200 p-2 rounded w-80 focus:outline-none focus:border-white/30"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          className="bg-black/20 border border-white/10 text-gray-300 rounded p-2 focus:outline-none focus:border-white/30 [&>option]:bg-[#121212] [&>option]:text-gray-300"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-400">Loading blogs...</p>
        </div>
      ) : blogs.length === 0 ? (
        <p className="text-gray-400">No blogs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white/5 backdrop-blur-md shadow-none rounded-xl border border-white/10 overflow-hidden">
            <thead>
              <tr className="bg-white/10 text-left text-gray-200 border-b border-white/10">
                <th className="py-3 px-4 font-medium text-gray-400">ID</th>
                <th className="py-3 px-4 font-medium text-gray-400">Image</th>
                <th className="py-3 px-4 font-medium text-gray-400">Title</th>
                <th className="py-3 px-4 font-medium text-gray-400">Author</th>
                <th className="py-3 px-4 font-medium text-gray-400">Published Date</th>
                <th className="py-3 px-4 font-medium text-gray-400">Status</th>
                <th className="py-3 px-4 font-medium text-gray-400">Views</th>
                <th className="py-3 px-4 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBlogs.map((blog) => (
                <tr key={blog.id} className="border-b border-white/5 hover:bg-white/5 text-gray-300 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-gray-400">{blog.id}</td>
                  <td className="py-3 px-4">
                    {blog.featuredImageUrl ? (
                      <img
                        src={blog.featuredImageUrl}
                        alt={blog.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-12 bg-black/20 border border-white/10 rounded flex items-center justify-center">
                        <FileText size={16} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-100">{blog.title}</div>
                    <div className="text-xs text-gray-400">{blog.slug}</div>
                  </td>
                  <td className="py-3 px-4">{blog.authorName || "N/A"}</td>
                  <td className="py-3 px-4 text-xs text-gray-400">
                    {blog.publishedAt
                      ? new Date(blog.publishedAt).toLocaleDateString("vi-VN")
                      : "Not published"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        blog.status
                      )}`}
                    >
                      {blog.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{blog.viewCount || 0}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(blog)}
                        className="p-1 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => openEditModal(blog)}
                        className="p-1 text-green-400 hover:bg-green-500/10 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>

                      {blog.status === "Draft" ? (
                        <button
                          onClick={() => handlePublish(blog.id)}
                          className="p-1 text-purple-400 hover:bg-purple-500/10 rounded transition-colors"
                          title="Publish"
                        >
                          <FilePlus size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnpublish(blog.id)}
                          className="p-1 text-orange-400 hover:bg-orange-500/10 rounded transition-colors"
                          title="Unpublish"
                        >
                          <FileText size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
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

        {/* === PAGINATION CONTROLS === */}
        {totalPages > 1 && (
          <Pagination className="mt-8 flex flex-wrap justify-center overflow-hidden mb-4">
            <PaginationContent className="flex-wrap gap-1 sm:gap-2">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                  }}
                />
              </PaginationItem>

              {getVisiblePages().map((p, i) => (
                <PaginationItem key={i}>
                  {p === -1 ? (
                    <PaginationEllipsis className="text-gray-500" />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={currentPage === p}
                      className={`cursor-pointer transition-colors ${
                        currentPage === p
                          ? "bg-primary text-black hover:bg-primary/90"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(p);
                      }}
                    >
                      {p}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  className="text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
        </div>
      )}

      {/* Create Modal */}
      {openCreate && (
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogContent className="bg-[#121212] backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-gray-200 max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Blog</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-black/20 border-white/10 text-gray-200"
                  placeholder="Blog title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Slug <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-black/20 border-white/10 text-gray-200"
                  placeholder="blog-slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-300">Summary</label>
                <textarea
                  className="bg-black/20 border border-white/10 text-gray-200 rounded-lg p-3 w-full focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-y"
                  rows={3}
                  placeholder="Brief summary..."
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="bg-black/20 border border-white/10 text-gray-200 rounded-lg p-3 w-full focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-y font-mono text-sm"
                  rows={10}
                  placeholder="Blog content (HTML supported)..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 text-gray-300">Featured Image</label>
                <input
                  className="w-full bg-black/20 border border-white/10 rounded-md text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:border-r file:border-white/10 file:bg-white/10 file:text-white file:font-medium hover:file:bg-white/20 cursor-pointer transition-all"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, featuredImage: e.target.files?.[0] || null })
                  }
                />
                {form.featuredImage && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">{form.featuredImage.name}</p>
                    <img
                      src={URL.createObjectURL(form.featuredImage)}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Tags (comma-separated)
                </label>
                <Input
                  className="bg-black/20 border-white/10 text-gray-200"
                  placeholder="review, iphone, apple, flagship"
                  value={tagsInput}
                  onChange={(e) => handleTagsInputChange(e.target.value)}
                />
                {form.tags.length > 0 && (
  <div className="mt-2 flex flex-wrap gap-2">
    {form.tags.map((tag, idx) => (
      <span
        key={idx}
        className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs"
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

              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Related Product IDs (comma-separated)
                </label>
                <Input
                  className="bg-black/20 border-white/10 text-gray-200"
                  placeholder="10, 61, 80"
                  value={productIdsInput}
                  onChange={(e) => handleProductIdsInputChange(e.target.value)}
                />
                {form.relatedProductIds.length > 0 && (
                  <p className="mt-1 text-xs text-gray-400">
                    Products: {form.relatedProductIds.join(", ")}
                  </p>
                )}
              </div>

              <div className="col-span-1 flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="publishImmediately"
                  checked={form.publishImmediately}
                  onChange={(e) =>
                    setForm({ ...form, publishImmediately: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-white/10 bg-black/20 accent-primary"
                />
                <label htmlFor="publishImmediately" className="text-sm font-medium">
                  Publish immediately
                </label>
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-2 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  className="bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    setOpenCreate(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 text-black font-medium">Create Blog</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Modal */}
      {openEdit && selectedBlog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] backdrop-blur-md border border-white/10 text-gray-200 w-full max-w-5xl rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
              <h3 className="text-xl font-semibold text-gray-100">Edit Blog</h3>
              <button
                onClick={() => {
                  setOpenEdit(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-black/20 border-white/10 text-gray-200"
                  placeholder="Blog title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

<div className="col-span-1">
  <label className="block text-sm font-medium mb-1 text-gray-300">
    Slug <span className="text-red-500">*</span>
  </label>
  <Input
    placeholder="blog-slug"
    value={form.slug}
    readOnly
    disabled
    className="bg-black/40 border-white/10 text-gray-500 cursor-not-allowed"
  />
  <p className="text-xs text-gray-500 mt-1">Slug cannot be changed</p>
</div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-300">Summary</label>
                <textarea
                  className="bg-black/20 border border-white/10 text-gray-200 rounded-lg p-3 w-full focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-y"
                  rows={3}
                  placeholder="Brief summary..."
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="bg-black/20 border border-white/10 text-gray-200 rounded-lg p-3 w-full focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-y font-mono text-sm"
                  rows={10}
                  placeholder="Blog content (HTML supported)..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>

              {selectedBlog.featuredImageUrl && !form.featuredImage && (
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1 text-gray-300">Current Image</label>
                  <img
                    src={selectedBlog.featuredImageUrl}
                    alt="Current"
                    className="w-full h-40 object-cover rounded"
                  />
                </div>
              )}

              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 text-gray-300">Update Image</label>
                <input
                  className="w-full bg-black/20 border border-white/10 rounded-md text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:border-r file:border-white/10 file:bg-white/10 file:text-white file:font-medium hover:file:bg-white/20 cursor-pointer transition-all"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, featuredImage: e.target.files?.[0] || null })
                  }
                />
                {form.featuredImage && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">{form.featuredImage.name}</p>
                    <img
                      src={URL.createObjectURL(form.featuredImage)}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Tags (comma-separated)
                </label>
                <Input
                  className="bg-black/20 border-white/10 text-gray-200"
                  placeholder="review, iphone, apple, flagship"
                  value={tagsInput}
                  onChange={(e) => handleTagsInputChange(e.target.value)}
                />
                {form.tags.length > 0 && (
  <div className="mt-2 flex flex-wrap gap-2">
    {form.tags.map((tag, idx) => (
      <span
        key={idx}
        className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs"
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

              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Related Product IDs (comma-separated)
                </label>
                <Input
                  className="bg-black/20 border-white/10 text-gray-200"
                  placeholder="10, 61, 80"
                  value={productIdsInput}
                  onChange={(e) => handleProductIdsInputChange(e.target.value)}
                />
                {form.relatedProductIds.length > 0 && (
                  <p className="mt-1 text-xs text-gray-400">
                    Products: {form.relatedProductIds.join(", ")}
                  </p>
                )}
              </div>

              <div className="col-span-1 flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="publishImmediatelyEdit"
                  checked={form.publishImmediately}
                  onChange={(e) =>
                    setForm({ ...form, publishImmediately: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-white/10 bg-black/20 accent-primary text-primary"
                />
                <label htmlFor="publishImmediatelyEdit" className="text-sm font-medium text-gray-200">
                  Publish immediately
                </label>
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-2 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  className="bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    setOpenEdit(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdate} className="bg-primary hover:bg-primary/90 text-black font-medium">Update Blog</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {openDetail && selectedBlog && (
        <Dialog open={openDetail} onOpenChange={setOpenDetail}>
          <DialogContent className="bg-[#121212] backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-gray-200 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Blog Details</DialogTitle>
            </DialogHeader>

            {selectedBlog.featuredImageUrl && (
              <img
                src={selectedBlog.featuredImageUrl}
                alt={selectedBlog.title}
                className="w-full h-64 object-cover rounded mb-4"
              />
            )}

            <div className="space-y-4">
              <div className="col-span-1 md:col-span-2">
                <h4 className="text-2xl font-bold">{selectedBlog.title}</h4>
                <p className="text-sm text-gray-400">Slug: {selectedBlog.slug}</p>
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
                <p className="text-sm text-gray-400">
                  <strong>Published:</strong>{" "}
                  {new Date(selectedBlog.publishedAt).toLocaleString("vi-VN")}
                </p>
              )}

              {selectedBlog.summary && (
                <div className="col-span-1 md:col-span-2">
                  <h5 className="font-semibold mb-2 text-gray-300">Summary</h5>
                  <p className="text-gray-400">{selectedBlog.summary}</p>
                </div>
              )}

              <div className="col-span-1 md:col-span-2">
                <h5 className="font-semibold mb-2 text-gray-300">Content</h5>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              </div>

              {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                <div className="col-span-1 md:col-span-2">
                  <h5 className="font-semibold mb-2">Tags</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedBlog.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedBlog.products && selectedBlog.products.length > 0 && (
                <div className="col-span-1 md:col-span-2">
                  <h5 className="font-semibold mb-2 text-gray-300">Related Products</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedBlog.products.map((product: any) => (
                      <div
                        key={product.id}
                        className="flex gap-3 p-3 border border-white/10 rounded hover:bg-white/5"
                      >
                        <img
                          src={product.primaryImagePath}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-400">
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

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="outline" className="bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white" onClick={() => setOpenDetail(false)}>
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
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}