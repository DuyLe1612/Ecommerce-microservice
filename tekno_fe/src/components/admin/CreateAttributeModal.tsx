"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { createAttribute } from "@/services/categories";

interface CategoryNode {
  id: number;
  name: string;
  subCategories?: CategoryNode[];
}

interface CreateAttributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryNode[];
  onSuccess: () => void;
}

export default function CreateAttributeModal({
  open,
  onOpenChange,
  categories,
  onSuccess,
}: CreateAttributeModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    inputType: "text",
    isGlobal: false,
    categoryId: "",
    initialValues: [] as string[],
  });
  
  const [newValueInput, setNewValueInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Flatten categories for select dropdown
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

    traverse(categories);
    return result;
  }, [categories]);

  const handleAddValue = () => {
    if (!newValueInput.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      initialValues: [...prev.initialValues, newValueInput.trim()]
    }));
    setNewValueInput("");
  };

  const handleRemoveValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      initialValues: prev.initialValues.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddValue();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      inputType: "text",
      isGlobal: false,
      categoryId: "",
      initialValues: [],
    });
    setNewValueInput("");
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        alert("Attribute name is required!");
        return;
      }

      if (!formData.isGlobal && !formData.categoryId) {
        alert("Please select a category!");
        return;
      }

      setLoading(true);

      await createAttribute({
        name: formData.name,
        inputType: formData.inputType,
        isGlobal: formData.isGlobal,
        categoryId: formData.isGlobal ? 0 : parseInt(formData.categoryId),
        initialValues: formData.initialValues,
      });

      alert("Attribute created successfully!");
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Create attribute failed:", error);
      alert("Failed to create attribute! " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#121212] backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-gray-200 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Attribute</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Attribute Name */}
          <div>
            <label className="text-sm font-medium block mb-1 text-gray-300">
              Attribute Name <span className="text-red-500">*</span>
            </label>
            <Input
              className="bg-black/20 border-white/10 text-gray-200"
              placeholder="vd: Brand, Color, Size"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Input Type */}
          <div>
            <label className="text-sm font-medium block mb-1 text-gray-300">
              Input Type <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full bg-black/20 border border-white/10 text-gray-200 rounded-md p-2 focus:outline-none focus:border-white/30 [&>option]:bg-[#121212] [&>option]:text-gray-300"
              value={formData.inputType}
              onChange={(e) => setFormData({ ...formData, inputType: e.target.value })}
            >
              <option value="text">Text</option>
              <option value="select">Select (Dropdown)</option>
              <option value="multiselect">Multi-select</option>
              <option value="checkbox">Checkbox</option>
              <option value="radio">Radio</option>
            </select>
          </div>

          {/* Is Global */}
          <div className="space-y-2">
            <label className="text-sm font-medium block text-gray-300">Attribute Scope</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-gray-200">
                <input
                  type="radio"
                  name="isGlobal"
                  checked={!formData.isGlobal}
                  onChange={() => setFormData({ ...formData, isGlobal: false })}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm">By Category</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-gray-200">
                <input
                  type="radio"
                  name="isGlobal"
                  checked={formData.isGlobal}
                  onChange={() => setFormData({ ...formData, isGlobal: true, categoryId: "" })}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm">Global (All categories)</span>
              </label>
            </div>
          </div>

          {/* Category Selection (only if not global) */}
          {!formData.isGlobal && (
            <div>
              <label className="text-sm font-medium block mb-1 text-gray-300">
                Select Category <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full bg-black/20 border border-white/10 text-gray-200 rounded-md p-2 focus:outline-none focus:border-white/30 [&>option]:bg-[#121212] [&>option]:text-gray-300"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">-- Select Category --</option>
                {flattenedCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {"—".repeat(cat.depth)} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Initial Values */}
          <div>
            <label className="text-sm font-medium block mb-2 text-gray-300">
              Initial Values (Optional)
            </label>
            
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Enter value... (Press Enter to add)"
                value={newValueInput}
                onChange={(e) => setNewValueInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-black/20 border-white/10 text-gray-200"
              />
              <Button onClick={handleAddValue} size="sm" type="button" className="bg-primary hover:bg-primary/90 text-black font-medium">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {formData.initialValues.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-black/20 rounded-lg border border-white/10">
                {formData.initialValues.map((value, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full"
                  >
                    <span className="text-sm">{value}</span>
                    <button
                      onClick={() => handleRemoveValue(index)}
                      className="hover:bg-primary/20 rounded-full p-1 transition-colors"
                      type="button"
                    >
                      <X className="w-3 h-3 text-primary" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button 
            onClick={handleSubmit} 
            className="flex-1 bg-primary hover:bg-primary/90 text-black font-medium"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Attribute"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }} 
            className="flex-1 bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}