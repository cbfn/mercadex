"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCart } from "@/features/cart/model/cart-context";
import { SHIPPING } from "@/shared/lib/cart";
import { formatBRL } from "@/shared/lib/currency";
import { Drawer } from "@/shared/ui/drawer";
import { Button } from "@/shared/ui/button";

export function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, removeFromCart, updateQty, subtotal, total } = useCart();

  const hasItems = useMemo(() => items.length > 0, [items]);

  return (
    <Drawer open={isOpen} title="Carrinho" onClose={closeCart}>
      <div className="space-y-4" data-testid="cart-step">
        {!hasItems ? (
          <div className="rounded-xl border border-dashed bg-muted/40 p-6 text-center">
            <p className="font-display text-xl font-semibold">Seu carrinho esta vazio.</p>
            <p className="mt-2 text-sm text-muted-foreground">Explore o catalogo e adicione seus eletronicos favoritos.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Confira os itens antes de seguir para o checkout.</p>
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[64px_1fr] gap-3 rounded-xl border bg-white p-3" data-testid="cart-item">
                <Image src={item.image} alt={item.title} width={64} height={64} className="rounded-lg object-cover" />
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <strong className="line-clamp-2 text-sm">{item.title}</strong>
                    <small className="text-sm font-semibold text-slate-800">{formatBRL(item.price * item.qty)}</small>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => updateQty(item.id, -1)} size="icon">
                      -
                    </Button>
                    <span className="inline-flex min-w-8 justify-center rounded-md border px-2 py-1 text-sm font-semibold">{item.qty}</span>
                    <Button variant="ghost" onClick={() => updateQty(item.id, 1)} size="icon">
                      +
                    </Button>
                    <Button variant="danger" aria-label="Remover" onClick={() => removeFromCart(item.id)} size="icon" className="ml-auto">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div className="space-y-2 rounded-xl border bg-muted/40 p-4 text-sm">
              <div className="flex justify-between"><p>Subtotal</p><p>{formatBRL(subtotal)}</p></div>
              <div className="flex justify-between"><p>Frete</p><p>{formatBRL(SHIPPING)}</p></div>
              <div className="flex justify-between border-t pt-2 font-semibold text-slate-900"><p>Total</p><p>{formatBRL(total)}</p></div>
            </div>
            <Button
              onClick={() => {
                closeCart();
                router.push("/checkout");
              }}
              data-testid="go-to-checkout"
              className="w-full"
            >
              Ir para checkout
            </Button>
          </>
        )}
      </div>
    </Drawer>
  );
}
