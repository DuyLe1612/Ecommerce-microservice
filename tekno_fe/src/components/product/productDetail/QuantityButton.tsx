import { Button } from "@/components/ui/button";
import { CartItem, useCart } from "@/hook/useCart";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import React from "react";

export default function QuantityButton({
  item,
  className,
}: {
  item: CartItem;
  className?: string;
}) {
  const { updateQuantity, removeFromCart, getItemCount } = useCart();

  const itemCount = getItemCount(item.variantId);
  const isOutOfStock = (item.availableStock ?? Number.MAX_SAFE_INTEGER) <= 0;

  const handleMinusItem = async () => {
    if (itemCount <= 1) {
      await removeFromCart(item.variantId);
    } else {
      await updateQuantity(item.variantId, itemCount - 1);
    }
  };

  const handlePlusItem = async () => {
    if (isOutOfStock) return;

    await updateQuantity(item.variantId, itemCount + 1);
  };

  return (
    <div className={cn("flex items-center gap-1 pb-1 text-base", className)}>
      <Button
        onClick={handleMinusItem}
        variant="outline"
        size="icon"
        disabled={itemCount === 1 || isOutOfStock}
        className="w-6 h-6 border-[1px] hover:bg-secondary/50 hoverEffect"
      >
        <Minus />
      </Button>

      <span className="font-semibold text-sm w-6 text-center text-secondary">
        {itemCount}
      </span>

      <Button
        onClick={handlePlusItem}
        variant="outline"
        size="icon"
        disabled={isOutOfStock}
        className="w-6 h-6 border-[1px] hover:bg-secondary/50 hoverEffect"
      >
        <Plus />
      </Button>
    </div>
  );
}
