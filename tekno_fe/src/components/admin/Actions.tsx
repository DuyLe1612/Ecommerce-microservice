import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Actions({ onEdit, onDelete }: any) {
  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        data-testid="edit-button"
        onClick={(e) => {
          e.stopPropagation();   // ⛔ Chặn click nổi lên <tr>
          onEdit();
        }}
        className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
      >
        <Pencil className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        data-testid="delete-button" 
        onClick={(e) => {
          e.stopPropagation();   // ⛔ Chặn click nổi lên <tr>
          onDelete();
        }}
        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
      >
        <Trash className="w-4 h-4" />
      </Button>
    </div>
  );
}
