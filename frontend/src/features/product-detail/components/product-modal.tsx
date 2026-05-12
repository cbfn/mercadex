"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useCart } from "@/features/cart/model/cart-context";
import { PRODUCTS } from "@/shared/mocks/products";
import { formatBRL } from "@/shared/lib/currency";
import { discountPct } from "@/shared/lib/catalog";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Modal } from "@/shared/ui/modal";

export function ProductModal() {
  const { selectedProductId, closeProduct, addToCart, openCart } = useCart();
  const [qty, setQty] = useState(1);

  const product = useMemo(() => {
    return PRODUCTS.find((item) => item.id === selectedProductId) ?? null;
  }, [selectedProductId]);

  if (!product) return null;

  return (
    <Modal
      open={Boolean(product)}
      title="Detalhes do produto"
      onClose={() => {
        setQty(1);
        closeProduct();
      }}
    >
      <div className="modalProduct">
        <Image src={product.image} alt={product.title} className="modalImage" width={640} height={640} />
        <div>
          <div className="row gap8">
            <Badge variant="info">{product.condition}</Badge>
            <span className="muted">{product.category}</span>
          </div>
          <h3>{product.title}</h3>
          <p>{product.description}</p>
          <div className="priceBox">
            <small>{formatBRL(product.originalPrice)}</small>
            <strong>{formatBRL(product.price)}</strong>
            <Badge variant="warning">-{discountPct(product.originalPrice, product.price)}%</Badge>
          </div>

          <div className="row gap8">
            <Button variant="ghost" onClick={() => setQty((value) => Math.max(1, value - 1))}>
              -
            </Button>
            <span data-testid="modal-qty">{qty}</span>
            <Button variant="ghost" onClick={() => setQty((value) => value + 1)}>
              +
            </Button>
          </div>

          <Button
            onClick={() => {
              addToCart(product, qty);
              setQty(1);
              closeProduct();
              openCart();
            }}
            data-testid="modal-add-to-cart"
          >
            Adicionar ao carrinho
          </Button>
        </div>
      </div>
    </Modal>
  );
}
