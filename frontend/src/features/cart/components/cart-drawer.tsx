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
        <div className="panelSection" data-testid="cart-step">
          {!items.length ? (
            <p>Seu carrinho esta vazio.</p>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="cartItem" data-testid="cart-item">
                  <Image src={item.image} alt={item.title} width={56} height={56} />
                  <div>
                    <strong>{item.title}</strong>
                    <small>{formatBRL(item.price * item.qty)}</small>
                  </div>
                  <div className="row gap8">
                    <Button variant="ghost" onClick={() => updateQty(item.id, -1)}>
                      -
                    </Button>
                    <span>{item.qty}</span>
                    <Button variant="ghost" onClick={() => updateQty(item.id, 1)}>
                      +
                    </Button>
                    <Button variant="danger" aria-label="Remover" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="totals">
                <p>Subtotal: {formatBRL(subtotal)}</p>
                <p>Frete: {formatBRL(SHIPPING)}</p>
                <p>Total: {formatBRL(total)}</p>
              </div>
              <Button onClick={() => setStep(1)} data-testid="go-to-delivery">
                Finalizar compra
              </Button>
            </>
          )}
        </div>
      )}

      {checkoutStep === 1 && (
        <form
          className="panelSection"
          data-testid="delivery-step"
          onSubmit={(event) => {
            event.preventDefault();
            setDeliveryValid(true);
            setStep(2);
          }}
        >
          <Input required placeholder="Nome completo" aria-label="Nome completo" />
          <Input required placeholder="CPF" aria-label="CPF" />
          <Input required placeholder="Telefone" aria-label="Telefone" />
          <Input required placeholder="CEP" aria-label="CEP" />
          <Input required placeholder="Endereco" aria-label="Endereco" />
          <div className="row gap8">
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
          <Button type="submit">Continuar para pagamento</Button>
          <Button type="button" variant="ghost" onClick={() => setStep(0)}>
            Voltar
          </Button>
        </form>
      )}

      {checkoutStep === 2 && (
        <div className="panelSection" data-testid="payment-step">
          <div data-testid="pix-content" style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
            />
          </div>
          <Button onClick={() => setStep(3)} disabled={!deliveryValid} data-testid="confirm-order-button">
            Confirmar pedido
          </Button>
          <Button type="button" variant="ghost" onClick={() => setStep(1)}>
            Voltar
          </Button>
        </div>
      )}

      {checkoutStep === 3 && (
        <div className="panelSection" data-testid="confirm-step">
          <h3>Pedido confirmado</h3>
          <p>Numero: #{orderNumber}</p>
          {confirmationItems.map((item) => (
            <div key={item.id} className="row between">
              <span>
                {item.qty}x {item.title}
              </span>
              <strong>{formatBRL(item.price * item.qty)}</strong>
            </div>
          ))}
          <p>Total pago: {formatBRL(total)}</p>
          <p data-testid="order-status">Status: PENDENTE_PAGAMENTO</p>
          <p data-testid="order-validity">
            Validade: Este pedido expira em 24 horas. Use o numero #{orderNumber} como descricao da transferencia PIX.
          </p>
          <Button
            onClick={() => {
              finishOrder();
            }}
            data-testid="finish-order-button"
          >
            Continuar comprando
          </Button>
        </div>
      )}
    </Drawer>
  );
}
