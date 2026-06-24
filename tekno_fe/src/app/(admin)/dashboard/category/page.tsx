"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  children?: CategoryNode[];
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
          
          if (node.children && node.children.length > 0) {
            updatedNode.children = assignParentIds(node.children, node.id);
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
    children?: CategoryNode[];
    depth: number;
  }> = [];

  const traverse = (nodes: CategoryNode[], depth = 0) => {
    nodes.forEach((node) => {
      result.push({
        ...node,
        depth,
      });
      if (node.children?.length) {
        traverse(node.children, depth + 1);
      }
    });
  };

  traverse(tree);
  return result;
}, [tree]);

// ✅ NEW: Filter categories by search query and expanded state
const filteredCategories = useMemo(() => {
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    return flatTableCategories.filter((cat) => {
      const matchId = String(cat.id).includes(query);
      const matchName = cat.name.toLowerCase().includes(query);
      const matchSlug = cat.slug?.toLowerCase().includes(query);

      return matchId || matchName || matchSlug;
    });
  }

  // If not searching, flatten but respect expandedIds
  const result: Array<any> = [];
  const traverse = (nodes: CategoryNode[], depth = 0) => {
    nodes.forEach((node) => {
      result.push({ ...node, depth });
      if (node.children?.length && expandedIds.has(node.id)) {
        traverse(node.children, depth + 1);
      }
    });
  };
  traverse(tree);
  return result;
}, [flatTableCategories, searchQuery, expandedIds, tree]);

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
      if (node.children?.length) {
        traverse(node.children, depth + 1);
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
        if (node.children?.length) {
          countNodes(node.children);
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
      alert("Category created successfully!");
    } catch (error) {
      console.error("Create failed:", error);
      alert("Create category failed!");
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
        alert("Name and Slug are required!");
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
      alert("Category updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Update category failed!");
    }
  };

  // DELETE Category
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategoryAPI(id);
      await loadCategoriesTree();
      alert("Category deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Delete category failed!");
    }
  };

  // Open Attributes Dialog
  const openAttributesDialog = (categoryId: number, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    setOpenAttributes(true);
  };


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
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Categories</h1>
          <p className="text-sm text-gray-400 mt-1">
            Total: {totalCategories} categories
            {searchQuery && ` (Found: ${filteredCategories.length})`}
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => setOpenGlobalAttributes(true)} 
            size="lg"
            variant="outline"
            className="bg-transparent border-white/20 text-gray-200 hover:bg-white/10 hover:text-white"
          >
            <Globe className="w-4 h-4 mr-2 text-blue-400" />
            Global Attributes
          </Button>
          
          <Button 
            onClick={() => setOpenCreateAttribute(true)} 
            size="lg"
            variant="outline"
            className="bg-transparent border-white/20 text-gray-200 hover:bg-white/10 hover:text-white"
          >
            <FolderPlus className="w-4 h-4 mr-2 text-green-400" />
            Create Attribute
          </Button>

          <Button onClick={() => setOpenCreate(true)} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Category
          </Button>
        </div>
      </div>

      {/* Search Box */}
      <div className="flex justify-between items-center py-4 px-4 bg-white/5 border border-white/10 rounded-xl mb-6">
        <input
          type="text"
          placeholder="🔍 Search by ID, Name, or Slug..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 bg-black/20 border border-white/10 text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-white/30"
        />
        {searchQuery && (
          <p className="text-xs text-gray-400 px-4">
            Found {filteredCategories.length} categories
          </p>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="bg-transparent overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white/5 backdrop-blur-md shadow-none rounded-xl border border-white/10 overflow-hidden">
              <thead className="bg-white/10 text-left text-gray-200 border-b border-white/10">
                <tr>
                  <th className="p-3 text-left min-w-[250px]">Name</th>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Icon</th>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Slug</th>
                  <th className="p-3 text-center">Children</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map((node) => {
                    const children = node.children || [];
                    const hasChildren = children.length > 0;
                    const isExpanded = expandedIds.has(node.id);
                    const depth = node.depth || 0;

                    return (
                      <tr key={node.id} className="border-b border-white/5 hover:bg-white/5 text-gray-300 transition-colors">
                        <td className="p-3">
                          <div 
                            className="flex items-center gap-3"
                            style={{ paddingLeft: `${depth * 2}rem` }}
                          >
                            {/* Branch visualizer & Toggle */}
                            <div className="relative flex items-center justify-center">
                              {/* Horizontal connector line for children */}
                              {depth > 0 && (
                                <div className="absolute -left-6 w-6 h-[1px] bg-white/10" />
                              )}
                              
                              {hasChildren ? (
                                <button
                                  onClick={() => toggleExpanded(node.id)}
                                  className="z-10 w-6 h-6 flex items-center justify-center bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-white/20 rounded shadow-md text-white transition-all"
                                >
                                  {isExpanded ? (
                                    <ChevronDown size={14} className="text-white" />
                                  ) : (
                                    <ChevronRight size={14} className="text-white" />
                                  )}
                                </button>
                              ) : (
                                <div className="z-10 w-6 h-6 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                </div>
                              )}
                            </div>
                            
                            <span className={`font-medium ${depth === 0 ? 'text-white text-base' : 'text-gray-200'}`}>
                              {node.name}
                            </span>
                          </div>
                        </td>

                        <td className="p-3 font-mono text-sm text-gray-400">#{node.id}</td>

                        <td className="p-3">
                          {node.iconPath ? (
                            <div className="w-8 h-8 bg-white/90 rounded flex items-center justify-center p-1 shadow-sm">
                              <img src={node.iconPath} alt="icon" className="w-full h-full object-contain drop-shadow-md" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-black/40 border border-white/10 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500">N/A</span>
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          {node.imageUrl ? (
                            <img src={node.imageUrl} alt="banner" className="w-20 h-12 rounded object-cover border border-white/10 shadow-sm" />
                          ) : (
                            <div className="w-20 h-12 bg-black/40 border border-white/10 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500">No image</span>
                            </div>
                          )}
                        </td>

                        <td className="p-3 text-sm text-gray-400">{node.slug || "-"}</td>

                        <td className="p-3 text-center">
                          {hasChildren && (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium shadow-sm">
                              {children.length}
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAttributesDialog(node.id, node.name)}
                              className="h-8 bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:text-white"
                            >
                              <Settings className="w-4 h-4 mr-1 text-gray-300" />
                              Attrs
                            </Button>
                            
                            <Actions
                              onEdit={() => openEditDialog(node)}
                              onDelete={() => handleDelete(node.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

            {/* Pagination Controls */}
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

      {/* CREATE CATEGORY DIALOG */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="bg-[#121212] backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-gray-200 max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium block mb-1 text-gray-300">
                Category Name <span className="text-red-500">*</span>
              </label>
              <Input
                className="bg-black/20 border-white/10 text-gray-200"
                placeholder="Enter category name"
                value={createData.name}
                onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1 text-gray-300">
                Slug <span className="text-red-500">*</span>
              </label>
              <Input
                className="bg-black/20 border-white/10 text-gray-200"
                placeholder="e.g. smartphones"
                value={createData.slug}
                onChange={(e) => setCreateData({ ...createData, slug: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1 text-gray-300">Parent Category</label>
              <select
                className="w-full bg-black/20 border border-white/10 text-gray-200 rounded-md p-2 focus:outline-none focus:border-white/30 [&>option]:bg-[#121212] [&>option]:text-gray-300"
                value={createData.parentId}
                onChange={(e) => setCreateData({ ...createData, parentId: e.target.value })}
              >
                <option value="">-- None --</option>
                {flattenedCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {"—".repeat(cat.depth)} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1 text-gray-300">Icon File</label>
              <input
                type="file"
                accept="image/*"
                className="border border-white/10 bg-black/20 text-gray-200 p-2 rounded w-full"
                onChange={(e) => setCreateData({ ...createData, iconFile: e.target.files?.[0] || null })}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1 text-gray-300">Image File</label>
              <input
                type="file"
                accept="image/*"
                className="border border-white/10 bg-black/20 text-gray-200 p-2 rounded w-full"
                onChange={(e) => setCreateData({ ...createData, imageFile: e.target.files?.[0] || null })}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => setOpenCreate(false)} className="flex-1 bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white">Cancel</Button>
            <Button onClick={handleCreate} className="flex-1">Create Category</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT CATEGORY DIALOG */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="bg-[#121212] backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-gray-200 max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium block mb-1 text-gray-300">
                Category Name <span className="text-red-500">*</span>
              </label>
              <Input className="bg-black/20 border-white/10 text-gray-200" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1 text-gray-300">
                Slug <span className="text-red-500">*</span>
              </label>
              <Input className="bg-black/20 border-white/10 text-gray-200" value={editData.slug} onChange={(e) => setEditData({ ...editData, slug: e.target.value })} />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1 text-gray-300">Parent Category</label>
              <select
                className="w-full bg-black/20 border border-white/10 text-gray-200 rounded-md p-2 focus:outline-none focus:border-white/30 [&>option]:bg-[#121212] [&>option]:text-gray-300"
                value={editData.parentId}
                onChange={(e) => setEditData({ ...editData, parentId: e.target.value })}
              >
                <option value="">-- None --</option>
                {flattenedCategories.filter((cat) => cat.id !== editData.id).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {"—".repeat(cat.depth)} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1 text-gray-300">Icon File</label>
              <input
                type="file"
                accept="image/*"
                className="border border-white/10 bg-black/20 text-gray-200 p-2 rounded w-full"
                onChange={(e) => setEditData({ ...editData, iconFile: e.target.files?.[0] || null })}
              />
              {editData.iconPath && !editData.iconFile && (
                <img src={editData.iconPath} className="w-12 h-12 object-contain border border-white/10 rounded mt-2 bg-black/20" alt="Current icon" />
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1 text-gray-300">Image File</label>
              <input
                type="file"
                accept="image/*"
                className="border border-white/10 bg-black/20 text-gray-200 p-2 rounded w-full"
                onChange={(e) => setEditData({ ...editData, imageFile: e.target.files?.[0] || null })}
              />
              {editData.imageUrl && !editData.imageFile && (
                <img src={editData.imageUrl} className="w-32 h-20 object-cover rounded border border-white/10 mt-2" alt="Current image" />
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => setOpenEdit(false)} className="flex-1 bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white">Cancel</Button>
            <Button onClick={handleEdit} className="flex-1">Save changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CATEGORY ATTRIBUTES MANAGEMENT DIALOG */}
      <Dialog open={openAttributes} onOpenChange={setOpenAttributes}>
        <VisuallyHidden>
          <DialogTitle>Attributes Management</DialogTitle>
        </VisuallyHidden>
        <DialogContent className="bg-[#121212] backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-gray-200 max-w-4xl max-h-[90vh] overflow-y-auto">
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