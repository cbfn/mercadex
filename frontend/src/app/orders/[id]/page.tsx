"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/features/auth/model/auth-context";
import { apiRequest, ApiError } from "@/shared/lib/api-client";
import { SiteHeader } from "@/shared/ui/site-header";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatBRL } from "@/shared/lib/currency";
import { SHIPPING } from "@/shared/lib/cart";

type OrderStatus = "PENDING_PIX" | "PAGO" | "ENVIADO" | "ENTREGUE" | "CANCELADO";

interface ApiOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    title: string;
    images: string[];
  };
}

interface ApiOrderDetail {
  id: string;
  buyerId: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
  };
  items: ApiOrderItem[];
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PIX: "Aguardando PIX",
  PAGO: "Pago",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const STATUS_VARIANT: Record<OrderStatus, "warning" | "info" | "success" | "neutral"> = {
  PENDING_PIX: "warning",
  PAGO: "info",
  ENVIADO: "info",
  ENTREGUE: "success",
  CANCELADO: "neutral",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=80&auto=format&fit=crop";

/** Extrai a URL da primeira imagem do produto, suportando `string[]` ou `{ url: string }[]`. */
function getProductImage(images: unknown): string {
  if (!Array.isArray(images) || images.length === 0) return FALLBACK_IMAGE;
  const first = images[0];
  if (typeof first === "string" && first.trim()) return first;
  if (typeof first === "object" && first !== null && "url" in first) {
    const url = (first as { url?: string }).url;
    if (typeof url === "string" && url.trim()) return url;
  }
  return FALLBACK_IMAGE;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [order, setOrder] = useState<ApiOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.replace(`/login?redirect=/orders/${params.id}`);
      return;
    }

    apiRequest<{ success: boolean; data: ApiOrderDetail }>(`/api/orders/${params.id}`)
      .then((res) => setOrder(res.data))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace(`/login?redirect=/orders/${params.id}`);
        } else if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError("Nao foi possivel carregar o pedido. Tente novamente.");
        }
      })
      .finally(() => setIsLoading(false));
  }, [user, isAuthLoading, router, params.id]);

  const subtotal = order ? order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) : 0;

  return (
    <main className="min-h-screen pb-16">
      <SiteHeader />

      <section className="container mt-8 max-w-2xl">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Meus pedidos
        </Link>

        {isLoading || isAuthLoading ? (
          <div className="mt-6 space-y-4" data-testid="order-detail-loading">
            <Skeleton className="h-8 w-48" />
            <Card className="space-y-4 p-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </Card>
          </div>
        ) : notFound ? (
          <div className="mt-10 rounded-xl border bg-white p-10 text-center" data-testid="order-not-found">
            <p className="font-display text-2xl font-semibold">Pedido nao encontrado</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Este pedido nao existe ou voce nao tem permissao para visualiza-lo.
            </p>
            <Link
              href="/orders"
              className="mt-5 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Ver meus pedidos
            </Link>
          </div>
        ) : error ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" data-testid="order-detail-error">
            {error}
          </p>
        ) : order ? (
          <div className="mt-6 space-y-6" data-testid="order-detail-content">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-bold text-slate-900">
                  Pedido #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
              <Badge variant={STATUS_VARIANT[order.status]} className="text-sm">
                {STATUS_LABEL[order.status]}
              </Badge>
            </div>

            {/* Itens do pedido */}
            <Card className="divide-y p-0 overflow-hidden">
              {order.items.map((item) => {
                const img = getProductImage(item.product.images);
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4" data-testid={`order-item-${item.id}`}>
                    <Image
                      src={img}
                      alt={item.product.title}
                      width={64}
                      height={64}
                      className="size-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{item.product.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.quantity}x {formatBRL(item.unitPrice)}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-slate-900">
                      {formatBRL(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </Card>

            {/* Resumo financeiro */}
            <Card className="space-y-2 p-5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Frete</span>
                <span>{formatBRL(SHIPPING)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatBRL(order.totalPrice)}</span>
              </div>
            </Card>

            {/* Endereco de entrega */}
            <Card className="space-y-1.5 p-5 text-sm">
              <p className="font-semibold text-slate-800">Endereco de entrega</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.street}, {order.shippingAddress.number}
                {order.shippingAddress.complement ? ` — ${order.shippingAddress.complement}` : ""}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress.city} — {order.shippingAddress.state}
              </p>
              <p className="text-muted-foreground">CEP {order.shippingAddress.cep}</p>
            </Card>
          </div>
        ) : null}
      </section>
    </main>
  );
}
