import React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  filters: Record<string, string[]>;
  HandleRemoveFilter?: (attr: string, value: string) => void;
}

export default function FilterChips({ filters, HandleRemoveFilter }: Props) {
  const chips = Object.entries(filters).flatMap(([attr, vals]) =>
    vals.map((v) => ({
      key: `${attr}|${v}`,
      label: `${attr}: ${v}`,
      attr,
      value: v,
    }))
  );

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <Badge
          key={c.key}
          variant="outline"
          className="flex items-center gap-2 border-primary/50 text-gray-200 bg-primary/10 hover:bg-primary/20 transition-colors rounded-lg px-3 py-1 shadow-sm"
        >
          {c.label}
          <X
            className="w-3.5 h-3.5 cursor-pointer text-gray-400 hover:text-primary transition-colors"
            onClick={() => HandleRemoveFilter?.(c.attr, c.value)}
          />
        </Badge>
      ))}
    </div>
  );
}
