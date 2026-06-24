"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, X, Globe } from "lucide-react";
import AttributeValuesManager from "@/components/admin/AttributeValueManager";
import {
  getGlobalAttributes,
  updateCategoryAttribute,
  deleteCategoryAttribute,
} from "@/services/categories";

interface GlobalAttribute {
  id: number;
  name: string;
  inputType: string;
  isGlobal: boolean;
}

interface GlobalAttributesManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GlobalAttributesManager({
  open,
  onOpenChange,
}: GlobalAttributesManagerProps) {
  const [attributes, setAttributes] = useState<GlobalAttribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<GlobalAttribute | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [expandedAttributeId, setExpandedAttributeId] = useState<number | null>(null);
  
  const [editForm, setEditForm] = useState({
    name: "",
    inputType: "text",
  });

  useEffect(() => {
    if (open) {
      loadGlobalAttributes();
    }
  }, [open]);

  const loadGlobalAttributes = async () => {
    try {
      setLoading(true);
      const data = await getGlobalAttributes();
      setAttributes(data || []);
    } catch (error) {
      console.error("Failed to load global attributes:", error);
      alert("Failed to load global attributes");
      setAttributes([]);
    } finally {
      setLoading(false);
    }
  };

  const resetEditForm = () => {
    setEditForm({
      name: "",
      inputType: "text",
    });
    setEditingAttribute(null);
    setShowEditForm(false);
  };

  const openEditAttribute = (attr: GlobalAttribute) => {
    setEditingAttribute(attr);
    setEditForm({
      name: attr.name,
      inputType: attr.inputType || "text",
    });
    setShowEditForm(true);
  };

  const handleUpdateAttribute = async () => {
    try {
      if (!editingAttribute) {
        alert("No attribute selected to update!");
        return;
      }

      if (!editForm.name.trim()) {
        alert("Attribute name is required!");
        return;
      }

      await updateCategoryAttribute(
        editingAttribute.id,
        editForm.name,
        editForm.inputType
      );

      resetEditForm();
      await loadGlobalAttributes();
      alert("Attribute updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update attribute! " + (error as Error).message);
    }
  };

  const handleDeleteAttribute = async (attributeId: number) => {
    if (!confirm("Are you sure you want to delete this global attribute?")) return;

    try {
      await deleteCategoryAttribute(attributeId);

      if (expandedAttributeId === attributeId) {
        setExpandedAttributeId(null);
      }

      await loadGlobalAttributes();
      alert("Attribute deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete attribute!");
    }
  };

  const toggleValuesSection = (attributeId: number) => {
    if (expandedAttributeId === attributeId) {
      setExpandedAttributeId(null);
    } else {
      setExpandedAttributeId(attributeId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#121212] backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-gray-200 max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Global Attributes Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Edit Form */}
          {showEditForm && editingAttribute && (
            <div className="border border-white/10 rounded-lg p-4 bg-black/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">
                  Edit Attribute: {editingAttribute.name}
                </h3>
                <Button variant="ghost" size="sm" onClick={resetEditForm} className="text-gray-400 hover:text-white hover:bg-white/10">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1 text-gray-300">
                    Attribute Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="bg-black/20 border-white/10 text-gray-200"
                    placeholder="vd: Brand, Color, Size"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1 text-gray-300">
                    Input Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full bg-black/40 border border-white/10 text-gray-500 rounded-md p-2 cursor-not-allowed [&>option]:bg-[#121212] [&>option]:text-gray-300"
                    value={editForm.inputType}
                    disabled
                  >
                    <option value="text">Text</option>
                    <option value="select">Select (Dropdown)</option>
                    <option value="multiselect">Multi-select</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="radio">Radio</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Input type cannot be changed after creation
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleUpdateAttribute} className="flex-1 bg-primary hover:bg-primary/90 text-black font-medium">
                  Update Attribute
                </Button>
                <Button variant="outline" onClick={resetEditForm} className="flex-1 bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Attributes List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Global Attributes List</h3>
              <span className="text-sm text-gray-500">
                Total: {attributes.length} attributes
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : attributes.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border border-white/10 rounded-lg bg-black/20">
                <Globe className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No global attributes yet.</p>
                <p className="text-sm mt-1">Use "Create Attribute" button to add one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attributes.map((attr) => (
                  <div
                    key={attr.id}
                    className="border border-white/10 rounded-lg p-4 bg-black/20 hover:bg-black/40 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-green-600" />
                          <h4 className="font-semibold text-base">{attr.name}</h4>
                          <span className="text-xs px-2 py-0.5 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded">
                            ID: {attr.id}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                            {attr.inputType || "text"}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded">
                            Global
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={expandedAttributeId === attr.id ? "default" : "outline"}
                          onClick={() => toggleValuesSection(attr.id)}
                          className={expandedAttributeId === attr.id ? "bg-primary hover:bg-primary/90 text-black" : "bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"}
                        >
                          Values {expandedAttributeId === attr.id ? "▲" : "▼"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditAttribute(attr)}
                          title="Edit attribute"
                          className="bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAttribute(attr.id)}
                          title="Delete attribute"
                          className="bg-transparent border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    {/* Attribute Values Section */}
                    {expandedAttributeId === attr.id && (
                      <AttributeValuesManager attributeId={attr.id} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}