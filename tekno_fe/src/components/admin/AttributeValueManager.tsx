"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import {
  getCategoryAttributeValues,
  addCategoryAttributeValue,
  deleteCategoryAttributeValue,
  type AttributeValue,
} from "@/services/categories";

interface AttributeValuesManagerProps {
  attributeId: number;
}

export default function AttributeValuesManager({ attributeId }: AttributeValuesManagerProps) {
  const [values, setValues] = useState<AttributeValue[]>([]);
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadValues();
  }, [attributeId]);

  const loadValues = async () => {
    try {
      setLoading(true);
      const response = await getCategoryAttributeValues(attributeId);
      
      // Response is AttributeValuesResponse, extract values array
      const valuesData = response?.values || [];
      
      console.log("Loaded attribute values:", valuesData);
      setValues(valuesData);
    } catch (error) {
      console.error("Failed to load attribute values:", error);
      setValues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddValue = async () => {
    if (!newValue.trim()) {
      alert("Please enter a value!");
      return;
    }

    try {
      await addCategoryAttributeValue(attributeId, newValue.trim());
      await loadValues();
      setNewValue("");
      alert("Value added successfully!");
    } catch (error) {
      console.error("Add value failed:", error);
      alert("Failed to add value!");
    }
  };

  const handleDeleteValue = async (valueId: number, value: string) => {
    if (!confirm(`Delete value "${value}"?`)) return;

    try {
      await deleteCategoryAttributeValue(valueId, value);
      await loadValues();
      alert("Value deleted successfully!");
    } catch (error) {
      console.error("Delete value failed:", error);
      alert("Failed to delete value!");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddValue();
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10 bg-black/20 rounded-lg p-4">
      <h5 className="font-semibold text-sm mb-3 text-gray-200">Values</h5>

      {/* Add new value */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Enter new value... (Press Enter to add)"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-black/20 border-white/10 text-gray-200"
        />
        <Button onClick={handleAddValue} size="sm" className="bg-primary hover:bg-primary/90 text-black font-medium">
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Values list */}
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
        </div>
      ) : values.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4 border border-white/10 rounded bg-black/20">
          No values yet
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {values.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary/20 transition-colors"
            >
              <span className="text-sm font-medium">{item.value}</span>
              <button
                onClick={() => handleDeleteValue(item.id, item.value)}
                className="hover:bg-primary/30 rounded-full p-1 transition-colors"
                title="Delete value"
              >
                <X className="w-3 h-3 text-primary" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        Total: {values.length} values
      </div>
    </div>
  );
}