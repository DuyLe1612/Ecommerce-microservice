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
    <div className={cn("flex items-center gap-1.5 pb-1 text-base", className)}>
      <Button
        onClick={handleMinusItem}
        variant="outline"
        size="icon"
        disabled={itemCount === 1 || isOutOfStock}
        className="w-8 h-8 rounded-md border-white/20 bg-black/20 hover:bg-white/10 hover:border-white/30 text-white/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Minus size={14} />
      </Button>

      <span className="font-semibold text-base w-8 text-center text-white/90">
        {itemCount}
      </span>

      <Button
        onClick={handlePlusItem}
        variant="outline"
        size="icon"
        disabled={isOutOfStock}
        className="w-8 h-8 rounded-md border-white/20 bg-black/20 hover:bg-white/10 hover:border-white/30 text-white/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus size={14} />
      </Button>
    </div>
  );
}
