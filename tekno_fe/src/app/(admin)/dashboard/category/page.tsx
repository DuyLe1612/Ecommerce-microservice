"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Plus, Settings, Globe, FolderPlus } from "lucide-react";
import Actions from "@/components/admin/Actions";
import AttributesManager from "@/components/admin/AttributesManager";
import CreateAttributeModal from "@/components/admin/CreateAttributeModal";
import GlobalAttributesManager from "@/components/admin/GlobalAttributesManager";
import {
  createCategory,
  updateCategory,
  deleteCategory as deleteCategoryAPI,
  getCategoriesTree,
} from "@/services/categories";

type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  iconPath?: string;
  imageUrl?: string;
  parentId?: number | null;
  isActive?: boolean;
  subCategories?: CategoryNode[];
};

export default function CategoryPage() {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  
  // Dialogs
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAttributes, setOpenAttributes] = useState(false);
  const [openCreateAttribute, setOpenCreateAttribute] = useState(false);
  const [openGlobalAttributes, setOpenGlobalAttributes] = useState(false);

  // ✅ NEW: Pagination & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Form states
  const [createData, setCreateData] = useState({
    name: "",
    slug: "",
    parentId: "",
    iconFile: null as File | null,
    imageFile: null as File | null,
  });

  const [editData, setEditData] = useState<any>({
    id: "",
    name: "",
    slug: "",
    parentId: "",
    isActive: true,
    iconPath: null,
    imageUrl: null,
    iconFile: null,
    imageFile: null,
  });

  // Attributes Management
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");

  // Load categories tree
  useEffect(() => {
    loadCategoriesTree();
  }, []);

  const loadCategoriesTree = async () => {
    try {
      setLoading(true);
      const categoriesData = await getCategoriesTree();
      
      const assignParentIds = (nodes: CategoryNode[], parentId: number | null = null): CategoryNode[] => {
        return nodes.map(node => {
          const updatedNode = { ...node, parentId: parentId };
          
          if (node.subCategories && node.subCategories.length > 0) {
            updatedNode.subCategories = assignParentIds(node.subCategories, node.id);
          }
          
          return updatedNode;
        });
      };
      
      const processedTree = assignParentIds(categoriesData);
      setTree(processedTree);
      
    } catch (error) {
      console.error("Failed to load categories tree:", error);
      alert("Không thể tải danh sách categories");
      setTree([]);
    } finally {
      setLoading(false);
    }
  };

// ✅ NEW: Flatten tree for table display with depth info
const flatTableCategories = useMemo(() => {
  const result: Array<{
    id: number;
    name: string;
    slug: string;
    iconPath?: string;
    imageUrl?: string;
    parentId?: number | null;
    isActive?: boolean;
    subCategories?: CategoryNode[];
    depth: number;
  }> = [];

  const traverse = (nodes: CategoryNode[], depth = 0) => {
    nodes.forEach((node) => {
      result.push({
        ...node,
        depth,
      });
      if (node.subCategories?.length) {
        traverse(node.subCategories, depth + 1);
      }
    });
  };

  traverse(tree);
  return result;
}, [tree]);

// ✅ NEW: Filter categories by search query
const filteredCategories = useMemo(() => {
  if (!searchQuery.trim()) {
    return flatTableCategories;
  }

  const query = searchQuery.toLowerCase().trim();

  return flatTableCategories.filter((cat) => {
    const matchId = String(cat.id).includes(query);
    const matchName = cat.name.toLowerCase().includes(query);
    const matchSlug = cat.slug.toLowerCase().includes(query);

    return matchId || matchName || matchSlug;
  });
}, [flatTableCategories, searchQuery]);

// ✅ NEW: Paginate filtered categories
const paginatedCategories = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredCategories.slice(startIndex, endIndex);
}, [filteredCategories, currentPage, itemsPerPage]);

const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

// Flatten tree for select options (dropdown parent selection)
const flattenedCategories = useMemo(() => {
  const result: Array<{ id: number; name: string; depth: number }> = [];
  
  const traverse = (nodes: CategoryNode[], depth = 0) => {
    nodes.forEach((node) => {
      result.push({
        id: node.id,
        name: node.name,
        depth,
      });
      if (node.subCategories?.length) {
        traverse(node.subCategories, depth + 1);
      }
    });
  };

  traverse(tree);
  return result;
}, [tree]);

  // Total categories count
  const totalCategories = useMemo(() => {
    let count = 0;
    const countNodes = (nodes: CategoryNode[]) => {
      nodes.forEach(node => {
        count++;
        if (node.subCategories?.length) {
          countNodes(node.subCategories);
        }
      });
    };
    countNodes(tree);
    return count;
  }, [tree]);

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // CREATE Category
  const handleCreate = async () => {
    try {
      if (!createData.name.trim() || !createData.slug.trim()) {
        alert("Tên và Slug là bắt buộc!");
        return;
      }

      const fd = new FormData();
      fd.append("Name", createData.name);
      fd.append("Slug", createData.slug);
      
      if (createData.parentId) {
        fd.append("ParentId", String(createData.parentId));
      }
      
      if (createData.iconFile) {
        fd.append("IconFile", createData.iconFile);
      }
      
      if (createData.imageFile) {
        fd.append("ImageFile", createData.imageFile);
      }

      await createCategory(fd);
      await loadCategoriesTree();
      
      setCreateData({
        name: "",
        slug: "",
        parentId: "",
        iconFile: null,
        imageFile: null,
      });
      
      setOpenCreate(false);
      alert("Tạo category thành công!");
    } catch (error) {
      console.error("Create failed:", error);
      alert("Tạo category thất bại!");
    }
  };

  // EDIT Category
  const openEditDialog = (category: CategoryNode) => {
    setEditData({
      id: category.id,
      name: category.name,
      slug: category.slug || "",
      parentId: category.parentId || "",
      isActive: category.isActive ?? true,
      iconPath: category.iconPath || null,
      imageUrl: category.imageUrl || null,
      iconFile: null,
      imageFile: null,
    });
    setOpenEdit(true);
  };

  const handleEdit = async () => {
    try {
      if (!editData.name.trim() || !editData.slug.trim()) {
        alert("Tên và Slug là bắt buộc!");
        return;
      }

      const fd = new FormData();
      fd.append("Id", String(editData.id));
      fd.append("Name", editData.name);
      fd.append("Slug", editData.slug);
      fd.append("IsActive", String(editData.isActive));
      
      if (editData.parentId) {
        fd.append("ParentId", String(editData.parentId));
      }
      
      if (editData.iconFile) {
        fd.append("IconFile", editData.iconFile);
      }
      
      if (editData.imageFile) {
        fd.append("ImageFile", editData.imageFile);
      }

      await updateCategory(editData.id, fd);
      await loadCategoriesTree();
      
      setOpenEdit(false);
      alert("Cập nhật category thành công!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Cập nhật category thất bại!");
    }
  };

  // DELETE Category
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa category này?")) return;

    try {
      await deleteCategoryAPI(id);
      await loadCategoriesTree();
      alert("Xóa category thành công!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Xóa category thất bại!");
    }
  };

  // Open Attributes Dialog
  const openAttributesDialog = (categoryId: number, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    setOpenAttributes(true);
  };

  // Render tree node
  const renderNode = (node: CategoryNode, depth = 0): React.ReactNode => {
    const children = node.subCategories || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(node.id);

    return (
      <React.Fragment key={node.id}>
        <tr className="border-b hover:bg-gray-50 transition-colors">
          <td className="p-3 w-12">
            <div className="flex items-center">
              <div style={{ width: depth * 24 }} />
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(node.id)}
                  className="hover:bg-gray-200 rounded p-1 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              ) : (
                <div className="w-6" />
              )}
            </div>
          </td>

          <td className="p-3 font-mono text-sm text-gray-600">#{node.id}</td>

          <td className="p-3">
            {node.iconPath ? (
              <img src={node.iconPath} alt="icon" className="w-8 h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-xs text-gray-400">N/A</span>
              </div>
            )}
          </td>

          <td className="p-3">
            {node.imageUrl ? (
              <img src={node.imageUrl} alt="banner" className="w-20 h-12 rounded object-cover border" />
            ) : (
              <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center border">
                <span className="text-xs text-gray-400">No image</span>
              </div>
            )}
          </td>

          <td className="p-3 font-medium">{node.name}</td>
          <td className="p-3 text-sm text-gray-600">{node.slug || "-"}</td>

          <td className="p-3 text-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              {children.length}
            </span>
          </td>

          <td className="p-3">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openAttributesDialog(node.id, node.name)}
                className="h-8"
              >
                <Settings className="w-4 h-4 mr-1" />
                Attrs
              </Button>
              
              <Actions
                onEdit={() => openEditDialog(node)}
                onDelete={() => handleDelete(node.id)}
              />
            </div>
          </td>
        </tr>

        {isExpanded && hasChildren && (
          <>{children.map((child) => renderNode(child, depth + 1))}</>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
  Tổng số: {totalCategories} categories
  {searchQuery && ` (Tìm thấy: ${filteredCategories.length})`}
</p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => setOpenGlobalAttributes(true)} 
            size="lg"
            variant="outline"
          >
            <Globe className="w-4 h-4 mr-2" />
            Global Attributes
          </Button>
          
          <Button 
            onClick={() => setOpenCreateAttribute(true)} 
            size="lg"
            variant="outline"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Create Attribute
          </Button>

          <Button onClick={() => setOpenCreate(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Tạo Category
          </Button>
        </div>
      </div>

      {/* Search Box */}
            <div className="flex justify-between py-5 bg-gray-50 rounded">
              <input
                type="text"
                placeholder="🔍 Tìm theo ID, Tên, hoặc Slug..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              {searchQuery && (
                <p className="text-xs text-gray-600 px-4">
                  Tìm thấy {filteredCategories.length} category
                </p>
              )}
            </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="p-3 text-left w-12"></th>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Icon</th>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Tên</th>
                  <th className="p-3 text-left">Slug</th>
                  <th className="p-3 text-center">Con</th>
                  <th className="p-3 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map((node) => renderNode(node))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      Chưa có category nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

            {/* Pagination Controls */}
            {filteredCategories.length > 0 && (
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    Hiển thị:
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border rounded px-2 py-1"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </label>
                  <span className="text-sm text-gray-600">
                    Từ {(currentPage - 1) * itemsPerPage + 1} đến{" "}
                    {Math.min(currentPage * itemsPerPage, filteredCategories.length)} trong{" "}
                    {filteredCategories.length} categories
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Trước
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 border rounded ${
                          currentPage === page
                            ? "bg-blue-500 text-white border-blue-500"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau →
                  </button>
                </div>
              </div>
            )}
        </div>
      )}

      {/* CREATE CATEGORY DIALOG */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo Category Mới</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Tên Category <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nhập tên category"
                value={createData.name}
                onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="vd: dien-thoai"
                value={createData.slug}
                onChange={(e) => setCreateData({ ...createData, slug: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Category Cha</label>
              <select
                className="w-full border rounded-md p-2"
                value={createData.parentId}
                onChange={(e) => setCreateData({ ...createData, parentId: e.target.value })}
              >
                <option value="">-- Không có --</option>
                {flattenedCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {"—".repeat(cat.depth)} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Icon File</label>
              <input
                type="file"
                accept="image/*"
                className="border p-2 rounded w-full"
                onChange={(e) => setCreateData({ ...createData, iconFile: e.target.files?.[0] || null })}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Image File</label>
              <input
                type="file"
                accept="image/*"
                className="border p-2 rounded w-full"
                onChange={(e) => setCreateData({ ...createData, imageFile: e.target.files?.[0] || null })}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={handleCreate} className="flex-1">Tạo Category</Button>
            <Button variant="outline" onClick={() => setOpenCreate(false)} className="flex-1">Hủy</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT CATEGORY DIALOG */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Tên Category <span className="text-red-500">*</span>
              </label>
              <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <Input value={editData.slug} onChange={(e) => setEditData({ ...editData, slug: e.target.value })} />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Category Cha</label>
              <select
                className="w-full border rounded-md p-2"
                value={editData.parentId}
                onChange={(e) => setEditData({ ...editData, parentId: e.target.value })}
              >
                <option value="">-- Không có --</option>
                {flattenedCategories.filter((cat) => cat.id !== editData.id).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {"—".repeat(cat.depth)} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Icon File</label>
              <input
                type="file"
                accept="image/*"
                className="border p-2 rounded w-full"
                onChange={(e) => setEditData({ ...editData, iconFile: e.target.files?.[0] || null })}
              />
              {editData.iconPath && !editData.iconFile && (
                <img src={editData.iconPath} className="w-12 h-12 object-contain border rounded mt-2" alt="Current icon" />
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Image File</label>
              <input
                type="file"
                accept="image/*"
                className="border p-2 rounded w-full"
                onChange={(e) => setEditData({ ...editData, imageFile: e.target.files?.[0] || null })}
              />
              {editData.imageUrl && !editData.imageFile && (
                <img src={editData.imageUrl} className="w-32 h-20 object-cover rounded border mt-2" alt="Current image" />
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={handleEdit} className="flex-1">Lưu thay đổi</Button>
            <Button variant="outline" onClick={() => setOpenEdit(false)} className="flex-1">Hủy</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CATEGORY ATTRIBUTES MANAGEMENT DIALOG */}
      <Dialog open={openAttributes} onOpenChange={setOpenAttributes}>
        <VisuallyHidden>
          <DialogTitle>Quản lý Attribute</DialogTitle>
        </VisuallyHidden>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCategoryId && (
            <AttributesManager
              categoryId={selectedCategoryId}
              categoryName={selectedCategoryName}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* CREATE ATTRIBUTE MODAL */}
      <CreateAttributeModal
        open={openCreateAttribute}
        onOpenChange={setOpenCreateAttribute}
        categories={tree}
        onSuccess={loadCategoriesTree}
      />

      {/* GLOBAL ATTRIBUTES MANAGER */}
      <GlobalAttributesManager
        open={openGlobalAttributes}
        onOpenChange={setOpenGlobalAttributes}
      />
    </div>
  );
}