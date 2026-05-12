"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { Trash2, QrCode, Clipboard, CheckCircle2 } from "lucide-react";
import { useCart } from "@/features/cart/model/cart-context";
import { SHIPPING } from "@/shared/lib/cart";
import { formatBRL } from "@/shared/lib/currency";
import { Drawer } from "@/shared/ui/drawer";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQty,
    subtotal,
    total,
    checkoutStep,
    setStep,
    finishOrder
  } = useCart();

  const [orderNumber] = useState(() => `MX${Date.now().toString().slice(-8)}`);
  const [deliveryValid, setDeliveryValid] = useState(false);
  const [copied, setCopied] = useState(false);
  const confirmationItems = useMemo(() => [...items], [items]);

  const PIX_KEY = "mercadex@pagamentos.com.br";

  const handleCopyPix = useCallback(() => {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <Drawer open={isOpen} title="Carrinho" onClose={closeCart}>
      {checkoutStep === 0 && (
        <div className="space-y-4" data-testid="cart-step">
          {!items.length ? (
            <div className="rounded-xl border border-dashed bg-muted/40 p-6 text-center">
              <p className="font-display text-xl font-semibold">Seu carrinho esta vazio.</p>
              <p className="mt-2 text-sm text-muted-foreground">Explore o catálogo e adicione seus eletrônicos favoritos.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Confira os itens antes de seguir para entrega e pagamento.</p>
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
              <Button onClick={() => setStep(1)} data-testid="go-to-delivery" className="w-full">
                Finalizar compra
              </Button>
            </>
          )}
        </div>
      )}

      {checkoutStep === 1 && (
        <form
          className="space-y-3"
          data-testid="delivery-step"
          onSubmit={(event) => {
            event.preventDefault();
            setDeliveryValid(true);
            setStep(2);
          }}
        >
          <p className="text-sm text-muted-foreground">Preencha seus dados para liberar o pagamento.</p>
          <Input required placeholder="Nome completo" aria-label="Nome completo" />
          <Input required placeholder="CPF" aria-label="CPF" />
          <Input required placeholder="Telefone" aria-label="Telefone" />
          <Input required placeholder="CEP" aria-label="CEP" />
          <Input required placeholder="Endereco" aria-label="Endereco" />
          <div className="grid grid-cols-2 gap-2">
            <Input required placeholder="Cidade" aria-label="Cidade" />
            <Select required aria-label="UF" defaultValue="">
              <option value="" disabled>
                UF
              </option>
              <option>SP</option>
              <option>RJ</option>
              <option>MG</option>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Continuar para pagamento</Button>
            <Button type="button" variant="ghost" onClick={() => setStep(0)} className="flex-1">Voltar</Button>
          </div>
        </form>
      )}

      {checkoutStep === 2 && (
        <div className="space-y-3" data-testid="payment-step">
          <div data-testid="pix-content" className="space-y-3 rounded-xl border bg-muted/30 p-4">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
              <QrCode size={20} /> Pague via PIX
            </h3>
            <p>Total a transferir: <strong>{formatBRL(total)}</strong></p>
            <p>Chave PIX: <strong>{PIX_KEY}</strong></p>
            <Button type="button" onClick={handleCopyPix} data-testid="copy-pix-button">
              {copied ? <CheckCircle2 size={16} /> : <Clipboard size={16} />}
              {copied ? "Copiado!" : "Copiar chave"}
            </Button>
            <Image
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(PIX_KEY)}`}
              alt="QR Code PIX"
              width={150}
              height={150}
              data-testid="pix-qrcode"
              unoptimized
              className="rounded-md border bg-white p-2"
            />
          </div>
          <Button onClick={() => setStep(3)} disabled={!deliveryValid} data-testid="confirm-order-button" className="w-full">
            Confirmar pedido
          </Button>
          <Button type="button" variant="ghost" onClick={() => setStep(1)} className="w-full">
            Voltar
          </Button>
        </div>
      )}

      {checkoutStep === 3 && (
        <div className="space-y-3" data-testid="confirm-step">
          <h3 className="font-display text-2xl font-semibold">Pedido confirmado</h3>
          <p className="text-sm text-muted-foreground">Numero: #{orderNumber}</p>
          {confirmationItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
              <span>
                {item.qty}x {item.title}
              </span>
              <strong>{formatBRL(item.price * item.qty)}</strong>
            </div>
          ))}
          <p className="font-semibold">Total pago: {formatBRL(total)}</p>
          <p data-testid="order-status" className="text-sm">Status: PENDENTE_PAGAMENTO</p>
          <p data-testid="order-validity" className="text-sm text-muted-foreground">
            Validade: Este pedido expira em 24 horas. Use o numero #{orderNumber} como descricao da transferencia PIX.
          </p>
          <Button
            onClick={() => {
              finishOrder();
            }}
            data-testid="finish-order-button"
            className="w-full"
          >
            Continuar comprando
          </Button>
        </div>
      )}
    </Drawer>
  );
}
