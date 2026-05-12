"use client";

import Image from "next/image";
import { CATEGORIES, PRODUCTS } from "@/shared/mocks/products";
import { useCatalogFilters } from "@/features/catalog/model/use-catalog-filters";
import { useCart } from "@/features/cart/model/cart-context";
import { ProductModal } from "@/features/product-detail/components/product-modal";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { formatBRL } from "@/shared/lib/currency";

export function StorefrontPage() {
  const { category, searchQuery, sortBy, filteredProducts, setCategory, setSearchQuery, setSortBy, resetFilters } =
    useCatalogFilters(PRODUCTS);
  const { quantity, openCart, openProduct, closeProduct, closeCart, selectedProductId, isOpen } = useCart();

  const hasOverlay = Boolean(selectedProductId) || isOpen;

  return (
    <main>
      {hasOverlay && <div className="pageOverlay" onClick={() => (selectedProductId ? closeProduct() : closeCart())} />}

      <header className="header">
        <div className="container headerRow">
          <strong>Mercadex</strong>
          <Input
            data-testid="search-input"
            aria-label="Buscar produtos"
            placeholder="Buscar produtos"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <Button onClick={openCart} data-testid="open-cart-button">
            Carrinho ({quantity})
          </Button>
        </div>
      </header>

      <section className="container toolbar">
        <div className="categories" role="tablist" aria-label="Categorias">
          {CATEGORIES.map((item) => {
            const active = item.label === category;
            return (
              <button
                key={item.label}
                onClick={() => setCategory(item.label)}
                aria-pressed={active}
                data-testid={`category-${item.label}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div>
          <Select
            aria-label="Ordenacao"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
            data-testid="sort-select"
          >
            <option value="relevancia">Mais relevantes</option>
            <option value="menor">Menor preco</option>
            <option value="maior">Maior preco</option>
            <option value="vendidos">Mais vendidos</option>
          </Select>
        </div>
      </section>

      <section className="container">
        {!filteredProducts.length ? (
          <div data-testid="empty-state">
            <p>Nenhum produto encontrado</p>
            <button data-testid="reset-filters" onClick={resetFilters}>Limpar filtros</button>
          </div>
        ) : (
          <div className="grid" data-testid="products-grid">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="card" data-testid="product-card">
                <Image src={product.image} alt={product.title} width={400} height={280} />
                <h3>{product.title}</h3>
                <p>{product.category}</p>
                <strong>{formatBRL(product.price)}</strong>
                <div className="row">
                  <Button variant="secondary" onClick={() => openProduct(product.id)} data-testid={`open-product-${product.id}`}>
                    Ver detalhes
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <ProductModal />
      <CartDrawer />
    </main>
  );
}
