"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, X } from "lucide-react";
import {
  getCategoryAttributes,
  updateCategoryAttribute,
  deleteCategoryAttribute,
} from "@/services/categories";
import { CategoryAttribute } from "@/type/categories";
import AttributeValuesManager from "@/components/admin/AttributeValueManager";

interface AttributesManagerProps {
  categoryId: number;
  categoryName: string;
}

export default function AttributesManager({ categoryId, categoryName }: AttributesManagerProps) {
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<CategoryAttribute | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  const [attributeForm, setAttributeForm] = useState({
    name: "",
    inputType: "text",
  });

  // State riêng cho việc toggle values section
  const [expandedAttributeId, setExpandedAttributeId] = useState<number | null>(null);

  useEffect(() => {
    loadAttributes();
  }, [categoryId]);

  const loadAttributes = async () => {
    try {
      setLoadingAttributes(true);
      const data = await getCategoryAttributes(categoryId);
      setAttributes(data || []);
    } catch (error) {
      console.error("Failed to load attributes:", error);
      setAttributes([]);
    } finally {
      setLoadingAttributes(false);
    }
  };

  const resetAttributeForm = () => {
    setAttributeForm({
      name: "",
      inputType: "text",
    });
    setEditingAttribute(null);
    setShowEditForm(false);
  };

  const handleUpdateAttribute = async () => {
    try {
      if (!editingAttribute) {
        alert("No attribute selected to update!");
        return;
      }

      if (!attributeForm.name.trim()) {
        alert("Attribute name is required!");
        return;
      }

      await updateCategoryAttribute(
        editingAttribute.id, 
        attributeForm.name,
        attributeForm.inputType
      );

      // Reset form trước khi load lại
      resetAttributeForm();
      
      // Load lại danh sách attributes
      await loadAttributes();
      alert("Attribute updated successfully!");
    } catch (error) {
      alert("Failed to update attribute! " + (error as Error).message);
    }
  };

  const handleDeleteAttribute = async (attributeId: number) => {
    if (!confirm("Are you sure you want to delete this attribute?")) return;

    try {
      await deleteCategoryAttribute(attributeId);
      await loadAttributes();
      
      // Close values section if this attribute was expanded
      if (expandedAttributeId === attributeId) {
        setExpandedAttributeId(null);
      }
      
      alert("Attribute deleted successfully!");
    } catch (error) {
      console.error("Delete attribute failed:", error);
      alert("Failed to delete attribute!");
    }
  };

  const openEditAttribute = (attr: CategoryAttribute) => {
    setEditingAttribute(attr);
    setAttributeForm({
      name: attr.name,
      inputType: (attr as any).inputType || "text",
    });
    setShowEditForm(true);
  };

  const toggleValuesSection = (attributeId: number) => {
    if (expandedAttributeId === attributeId) {
      setExpandedAttributeId(null);
    } else {
      setExpandedAttributeId(attributeId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Attributes Management - {categoryName}</h2>
      </div>

      {/* Edit Attribute Form */}
      {showEditForm && editingAttribute && (
        <div className="border border-white/10 rounded-lg p-4 bg-black/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">
              Edit Attribute: {editingAttribute.name}
            </h3>
            <Button variant="ghost" size="sm" onClick={resetAttributeForm} className="text-gray-400 hover:text-white hover:bg-white/10">
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
                value={attributeForm.name}
                onChange={(e) => setAttributeForm({ ...attributeForm, name: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                This name will be displayed to users when filtering or viewing products
              </p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1 text-gray-300">
                Input Type <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full bg-black/40 border border-white/10 text-gray-500 rounded-md p-2 cursor-not-allowed [&>option]:bg-[#121212] [&>option]:text-gray-300"
                value={attributeForm.inputType}
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
            <Button variant="outline" onClick={resetAttributeForm} className="flex-1 bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Attributes List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Attributes List</h3>
          <p className="text-sm text-gray-500">
            Use the "Create Attribute" button above to add a new attribute for this category
          </p>
        </div>

        {loadingAttributes ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : attributes.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border border-white/10 rounded-lg bg-black/20">
            No attributes yet. Use the "Create Attribute" button in the header to add one!
          </div>
        ) : (
          <div className="space-y-3">
            {attributes.map((attr) => (
              <div key={attr.id} className="border border-white/10 rounded-lg p-4 bg-black/20 hover:bg-black/40 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-base text-gray-200">{attr.name}</h4>
                      <span className="text-xs px-2 py-0.5 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded">
                        ID: {attr.id}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                        {(attr as any).inputType || "text"}
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
  );
}