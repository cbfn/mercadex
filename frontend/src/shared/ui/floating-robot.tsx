"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type SearchProductItem = {
  id: number;
  title: string;
  price: number;
  condition?: string;
  category?: { name?: string } | string;
};

type SearchResponse = {
  success: boolean;
  data?: {
    query: string;
    found: boolean;
    total: number;
    message?: string;
    items: SearchProductItem[];
  };
};

type SearchResultState = {
  summary: string;
  items: SearchProductItem[];
};

const DEFAULT_ASSISTANT_MESSAGE =
  "Oi! Eu sou seu assistente virtual. Pode me perguntar!";

function buildSearchResult(response: SearchResponse | null): SearchResultState | null {
  if (!response?.data) return null;

  const { found, total, items, message } = response.data;

  return {
    summary: message ?? (found && total > 0 ? `Sim! Encontrei ${total} produto${total === 1 ? "" : "s"}.` : "Não encontrei produtos."),
    items: found && total > 0 ? items : [],
  };
}

export function FloatingRobot() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResultState | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResult(null);
      return;
    }

    setLoading(true);

    try {
      const result = await fetch(`${API_BASE_URL}/api/products/search?q=${encodeURIComponent(trimmedQuery)}`);
      const data = (await result.json()) as SearchResponse;

      setResult(buildSearchResult(data));
    } catch {
      setResult({
        summary: "Não consegui consultar os produtos agora.",
        items: [],
      });
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setQuery("");
    setResult(null);
    setLoading(false);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleSelectProduct() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Abrir assistente virtual"
        data-testid="floating-robot-button"
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-orange-200/70 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white shadow-[0_18px_50px_rgba(249,115,22,0.35)] ring-1 ring-orange-200/50 transition-transform duration-200 hover:scale-105 hover:shadow-[0_24px_70px_rgba(249,115,22,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
      >
        <Bot className="h-7 w-7" aria-hidden="true" />
      </button>

      <Modal
        open={open}
        title="Assistente virtual"
        onClose={handleClose}
        overlayClassName="items-end justify-end p-3 sm:p-4 md:p-6"
        panelClassName="flex h-[calc(100vh-1.5rem)] max-h-[760px] w-full max-w-[420px] flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/95 shadow-[0_20px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl"
        bodyClassName="flex-1 min-h-0 overflow-hidden p-3 sm:p-4"
        headerClassName="border-white/70 bg-white/80 backdrop-blur-xl"
        titleClassName="text-slate-900"
        closeButtonClassName="text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <div className="flex h-full min-h-0 flex-col gap-4 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))]">
          <div className="rounded-[1.5rem] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.96))] p-4 shadow-sm">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Assistente Mercadex
            </p>
            <p className="max-w-sm text-sm text-slate-600">
              Pergunte sobre produtos, categorias ou informações da loja. Eu te ajudo a encontrar o que precisa.
            </p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-600">
              <Sparkles className="h-4 w-4 text-slate-500" aria-hidden="true" />
              Resposta
            </div>
            <div aria-label="Resposta do assistente" className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-800 shadow-inner">
              <div className="flex h-full flex-col">
                <p className="shrink-0 font-semibold text-slate-900">{loading ? "Buscando produtos..." : result?.summary ?? DEFAULT_ASSISTANT_MESSAGE}</p>

                {!loading && result?.items?.length ? (
                  <ul className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-scroll pr-1">
                    {result.items.map((item, index) => (
                      <li key={item.id}>
                        <Link
                          href={`/products/${item.id}`}
                          onClick={handleSelectProduct}
                          className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                          aria-label={`Abrir produto ${item.title}`}
                        >
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                            {index + 1}
                          </span>
                          <span className="font-medium text-slate-800">{item.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>

          <form onSubmit={handleSearch} className="mt-auto shrink-0 flex items-end gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex-1">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Digite sua busca, ex.: produtos usados"
                aria-label="Campo de busca do assistente"
                autoFocus
              />
            </div>
            <Button type="submit" disabled={loading} className="gap-2">
              <Send className="h-4 w-4" aria-hidden="true" />
              {loading ? "Buscando" : "Enviar"}
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}
