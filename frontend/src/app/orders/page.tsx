"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/model/auth-context";
import { apiRequest, ApiError } from "@/shared/lib/api-client";
import { SiteHeader } from "@/shared/ui/site-header";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatBRL } from "@/shared/lib/currency";

type OrderStatus = "PENDING_PIX" | "PAGO" | "ENVIADO" | "ENTREGUE" | "CANCELADO";

interface ApiOrder {
  id: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  items: { id: string }[];
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
    month: "short",
    year: "numeric",
  });
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<ApiOrder[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.replace("/login?redirect=/orders");
      return;
    }

    apiRequest<{ success: boolean; data: ApiOrder[] }>("/api/orders")
      .then((res) => setOrders(res.data))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login?redirect=/orders");
        } else {
          setError("Nao foi possivel carregar os pedidos. Tente novamente.");
        }
      })
      .finally(() => setIsLoading(false));
  }, [user, isAuthLoading, router]);

  return (
    <main className="min-h-screen pb-16">
      <SiteHeader />

      <section className="container mt-10 max-w-2xl" data-testid="orders-page">
        <h1 className="font-display text-3xl font-bold text-slate-900">Meus pedidos</h1>

        {isLoading || isAuthLoading ? (
          <div className="mt-6 space-y-4" data-testid="orders-loading">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="mb-3 h-4 w-32" />
                <Skeleton className="h-6 w-24" />
              </Card>
            ))}
          </div>
        ) : error ? (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" data-testid="orders-error">
            {error}
          </p>
        ) : orders && orders.length === 0 ? (
          <div className="mt-10 rounded-xl border bg-white p-10 text-center" data-testid="orders-empty">
            <p className="font-display text-2xl font-semibold">Nenhum pedido encontrado</p>
            <p className="mt-2 text-sm text-muted-foreground">Seus pedidos aparecao aqui apos a compra.</p>
            <Link
              href="/"
              className="mt-5 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Explorar catalogo
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-4" data-testid="orders-list">
            {orders?.map((order) => (
              <li key={order.id}>
                <Link href={`/orders/${order.id}`} className="block">
                  <Card className="p-5 transition hover:shadow-md">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Pedido</p>
                        <p className="font-mono text-sm font-semibold text-slate-800" data-testid={`order-id-${order.id}`}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge variant={STATUS_VARIANT[order.status]}>{STATUS_LABEL[order.status]}</Badge>
                        <span className="text-sm font-semibold text-slate-900">{formatBRL(order.totalPrice)}</span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                    </p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
