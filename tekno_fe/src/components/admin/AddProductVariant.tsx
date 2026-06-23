"use client";

import { useEffect, useState } from "react";
import { getCategoryAttributes } from "@/services/categories";
import { createProductVariant, updateProductVariant, deleteProductVariant } from "@/services/products";
import { Pencil, Trash2, Plus, X } from "lucide-react";

type AddProductVariantProps = {
  productId: number;
  categoryId: number;
  existingVariants?: any[];
  onClose: () => void;
  onSuccess: () => void;
};

type AttrValue = {
  id: number;
  attributeId: number;
  value: string;
};

type Attr = {
  id: number;
  name: string;
  inputType: string;
  values: AttrValue[];
};

type VariantForm = {
  id?: number;
  sku: string;
  price: number;
  stock: number;
  attributeValues: Record<string, string>;
};

export default function AddProductVariant({
  productId,
  categoryId,
  existingVariants = [],
  onClose,
  onSuccess,
}: AddProductVariantProps) {
  const [attrs, setAttrs] = useState<Attr[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantForm | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState<VariantForm>({
    sku: "",
    price: 0,
    stock: 0,
    attributeValues: {},
  });

  // Load attributes and existing variants
useEffect(() => {
  const loadData = async () => {
    try {
      const data = await getCategoryAttributes(categoryId);

      setAttrs(
        data.map((a: any) => ({
          id: a.id,
          name: a.name,
          values: Array.isArray(a.value) ? a.value : [],
          selected: "",
        }))
      );
    } catch (err) {
      console.error(err);
      alert("Không load được attributes");
    }
  };

  if (categoryId) loadData();
}, [categoryId]);


  const openAddForm = () => {
    setEditingVariant(null);
    setFormData({
      sku: "",
      price: 0,
      stock: 0,
      attributeValues: {},
    });
    setIsFormOpen(true);
  };

  const openEditForm = (variant: any) => {
    const attributeValues: Record<string, string> = {};
    
    // Map variant attributes to attributeValues object
    variant.attributes?.forEach((attr: any) => {
      attributeValues[String(attr.id)] = Array.isArray(attr.value) 
        ? attr.value[0] 
        : attr.value;
    });

    setEditingVariant({
      id: variant.id,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      attributeValues,
    });
    setFormData({
      id: variant.id,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      attributeValues,
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.sku || formData.price <= 0) {
        alert("Please fill SKU and Price");
        return;
      }

      if (Object.keys(formData.attributeValues).length === 0) {
        alert("Please select at least one attribute value");
        return;
      }

      const attributeValuesPayload = Object.entries(formData.attributeValues).map(([id, valueStr]) => {
        const attr = attrs.find(a => a.id === Number(id));
        const val = attr?.values.find(v => v.value === valueStr);
        return {
          attributeId: Number(id),
          valueId: val?.id || 0,
        };
      });

      if (editingVariant?.id) {
        // Update existing variant
        await updateProductVariant(editingVariant.id, {
          productId,
          sku: formData.sku,
          price: formData.price,
          stock: formData.stock,
          status: "Active",
          attributeValues: attributeValuesPayload,
        });
      } else {
        // Create new variant
        await createProductVariant({
          productId,
          sku: formData.sku,
          price: formData.price,
          stock: formData.stock,
          status: "Active",
          attributeValues: attributeValuesPayload,
        });
      }

      setIsFormOpen(false);
      alert("Variant saved successfully!");
      onSuccess();
    } catch (err) {
      console.error("Save variant failed", err);
      alert("Failed to save variant");
    }
  };

  const handleDelete = async (variantId: number) => {
    if (!confirm("Delete this variant?")) return;

    try {
      await deleteProductVariant(variantId);
      setVariants(variants.filter(v => v.id !== variantId));
      alert("Variant deleted");
      onSuccess();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete variant");
    }
  };

  const updateAttributeValue = (attrId: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      attributeValues: {
        ...prev.attributeValues,
        [String(attrId)]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-[800px] rounded-lg p-6">
          <p className="text-center">Loading attributes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[800px] max-h-[90vh] overflow-y-auto rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Product Variants</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Category Attributes Info */}
        {attrs.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <h3 className="font-medium text-sm mb-2">Category Attributes:</h3>
            <div className="space-y-2">
              {attrs.map(attr => (
                <div key={attr.id} className="text-xs">
                  <strong>{attr.name}:</strong>{" "}
                  <span className="text-gray-600">
                    {attr.values.map(v => v.value).join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {attrs.length === 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              ⚠️ No attributes found for this category. Please add attributes to the category first.
            </p>
          </div>
        )}

        {/* Existing Variants List */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Existing Variants ({variants.length})</h3>
            <button
              onClick={openAddForm}
              disabled={attrs.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Add Variant
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No variants yet</p>
          ) : (
            <div className="space-y-3">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className="border rounded p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <div>
                          <span className="text-xs text-gray-600">SKU:</span>
                          <p className="font-medium">{variant.sku}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Price:</span>
                          <p className="font-medium">{variant.price.toLocaleString()}đ</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Stock:</span>
                          <p className="font-medium">{variant.stock}</p>
                        </div>
                      </div>

                      <div className="mt-2">
                        <span className="text-xs text-gray-600">Attributes:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {variant.attributes?.map((attr: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 rounded text-xs"
                            >
                              <strong>{attr.name}:</strong>{" "}
                              {Array.isArray(attr.value) ? attr.value.join(", ") : attr.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => openEditForm(variant)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(variant.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        {isFormOpen && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">
              {editingVariant ? "Edit Variant" : "Add New Variant"}
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">SKU *</label>
                <input
                  className="border rounded p-2 w-full"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., PROD-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <input
                  type="number"
                  className="border rounded p-2 w-full"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: +e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  className="border rounded p-2 w-full"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: +e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Attribute Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Attributes *</label>
              <div className="grid grid-cols-2 gap-3">
                {attrs.map((attr) => (
                  <div key={attr.id}>
                    <label className="text-xs text-gray-600 mb-1 block">
                      {attr.name} ({attr.inputType})
                    </label>
                    <select
                      className="border rounded p-2 w-full"
                      value={formData.attributeValues[String(attr.id)] || ""}
                      onChange={(e) => updateAttributeValue(attr.id, e.target.value)}
                    >
                      <option value="">-- Select {attr.name} --</option>
                      {attr.values.map((v) => (
                        <option key={v.id} value={v.value}>
                          {v.value}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSave}
              >
                {editingVariant ? "Update Variant" : "Add Variant"}
              </button>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}