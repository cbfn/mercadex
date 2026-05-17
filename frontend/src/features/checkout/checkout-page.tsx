'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, MapPinned, QrCode, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/features/cart/model/cart-context';
import { useAuth } from '@/features/auth/model/auth-context';
import { PixDisplay } from './pix-display';
import { apiRequest } from '@/shared/lib/api-client';
import { formatBRL } from '@/shared/lib/currency';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

interface ShippingAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
}

const STATIC_PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY ?? '00020126360014br.gov.bcb.pix0114+55119999999995204000053039865802BR5913Mercadex MVP6009SAO PAULO62070503***63041D3D';

interface BrasilCepResponse {
  city?: string;
  state?: string;
  street?: string;
  location?: {
    city?: string;
    state?: string;
  };
}

type CepLookupStatus = 'idle' | 'loading' | 'success' | 'error';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function toCepMask(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function normalizeState(value: string) {
  return value.toUpperCase().slice(0, 2);
}

function isAddressFilled(address: ShippingAddress) {
  return Boolean(
    onlyDigits(address.cep).length === 8 &&
      address.street.trim() &&
      address.number.trim() &&
      address.city.trim() &&
      normalizeState(address.state).length === 2
  );
}

function resolveBackendProductId(item: { id: number | string; backendProductId?: string }) {
  if (item.backendProductId && UUID_REGEX.test(item.backendProductId)) {
    return item.backendProductId;
  }

  if (typeof item.id === 'string' && UUID_REGEX.test(item.id)) {
    return item.id;
  }

  return null;
}

/**
 * Página de checkout com endereço, PIX estático e confirmação de pedido.
 * Após confirmação, limpa o carrinho e redireciona para /orders/:id.
 */
export function CheckoutPage() {
  const { items, finishOrder } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState<ShippingAddress>({
    cep: '',
    street: '',
    number: '',
    complement: '',
    city: '',
    state: '',
  });
  const [step, setStep] = useState<'address' | 'pix'>('address');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cepStatus, setCepStatus] = useState<CepLookupStatus>('idle');
  const [cepMessage, setCepMessage] = useState('');

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.qty, 0), [items]);
  const total = subtotal;
  const stepNumber = step === 'address' ? 1 : 2;

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login?redirect=/checkout');
    }
  }, [isAuthLoading, router, user]);

  useEffect(() => {
    const cep = onlyDigits(address.cep);

    if (cep.length !== 8) {
      setCepStatus('idle');
      setCepMessage('');
      return;
    }

    const controller = new AbortController();

    async function lookupCep() {
      setCepStatus('loading');
      setCepMessage('Consultando CEP para preencher cidade e estado...');

      try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('cep_lookup_failed');
        }

        const data = (await response.json()) as BrasilCepResponse;
        const city = (data.city ?? data.location?.city ?? '').trim();
        const state = normalizeState((data.state ?? data.location?.state ?? '').trim());
        const street = (data.street ?? '').trim();

        setAddress((prev) => ({
          ...prev,
          city: city || prev.city,
          state: state || prev.state,
          street: prev.street || street,
        }));

        if (city && state) {
          setCepStatus('success');
          setCepMessage('Cidade e estado preenchidos automaticamente pelo CEP.');
          return;
        }

        setCepStatus('error');
        setCepMessage('Nao foi possivel preencher cidade e estado automaticamente. Complete manualmente.');
      } catch {
        if (!controller.signal.aborted) {
          setCepStatus('error');
          setCepMessage('Falha ao consultar o CEP. Continue preenchendo cidade e estado manualmente.');
        }
      }
    }

    void lookupCep();

    return () => {
      controller.abort();
    };
  }, [address.cep]);

  if (isAuthLoading || !user) {
    return null;
  }

  if (!items.length) {
    return (
      <main className="pb-16">
        <header className="sticky top-0 z-40 border-b border-white/50 bg-white/80 backdrop-blur-xl">
          <div className="container flex h-20 items-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              <ArrowLeft className="size-4" /> Voltar
            </button>
          </div>
        </header>

        <section className="container mt-8">
          <Card className="rounded-2xl bg-white p-8 text-center">
            <p className="font-display text-2xl font-semibold">Seu carrinho esta vazio</p>
            <p className="mt-2 text-sm text-muted-foreground">Adicione ao menos um produto para iniciar o checkout.</p>
          </Card>
        </section>
      </main>
    );
  }

  const isAddressValid = isAddressFilled(address);

  const handleAddressFieldChange = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirm = async () => {
    setError('');
    setIsLoading(true);

    const orderItems = items
      .map((item) => {
        const productId = resolveBackendProductId(item);
        if (!productId) {
          return null;
        }

        return {
          productId,
          quantity: item.qty,
        };
      })
      .filter((item): item is { productId: string; quantity: number } => Boolean(item));

    if (orderItems.length !== items.length) {
      setIsLoading(false);
      setError('Nao foi possivel identificar um ou mais produtos do carrinho. Recarregue a pagina e tente novamente.');
      return;
    }

    try {
      const res = await apiRequest<{ success: boolean; data: { id: string } }>(
        '/api/orders',
        {
          method: 'POST',
          body: JSON.stringify({
            items: orderItems,
            shippingAddress: {
              cep: onlyDigits(address.cep),
              street: address.street.trim(),
              number: address.number.trim(),
              complement: address.complement?.trim() || undefined,
              city: address.city.trim(),
              state: normalizeState(address.state),
            },
          }),
        }
      );

      finishOrder();
      toast.success('Pedido criado com sucesso! Redirecionando para os detalhes.');
      router.push(`/orders/${res.data.id}`);
    } catch {
      setError('Erro ao criar pedido. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="pb-16">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="container flex h-20 items-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="size-4" /> Voltar
          </button>
        </div>
      </header>

      <section className="container mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" data-testid="checkout-page-content">
        <div className="space-y-4">
          <Card className="overflow-hidden rounded-2xl bg-white p-6">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              <MapPinned className="size-3.5 text-primary" /> Checkout seguro em etapas
            </p>

            <h1 className="font-display text-3xl font-bold leading-tight text-slate-900 md:text-4xl">Finalize seu pedido com clareza</h1>
            <p className="mt-3 text-sm text-slate-600 md:text-base">
              Etapa {stepNumber} de 2. Primeiro endereco de entrega, depois pagamento via PIX.
            </p>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-4 text-sm">
              <ShieldCheck className="mb-2 size-4 text-emerald-600" />
              Dados protegidos durante todo o checkout.
            </div>
            <div className="rounded-xl border bg-white p-4 text-sm">
              <MapPinned className="mb-2 size-4 text-sky-600" />
              CEP com preenchimento automatico de cidade e estado.
            </div>
            <div className="rounded-xl border bg-white p-4 text-sm">
              <QrCode className="mb-2 size-4 text-amber-500" />
              Pagamento por PIX com confirmacao imediata do pedido.
            </div>
          </div>

          <Card className="rounded-2xl bg-white p-5">
            <p className="text-sm font-semibold text-slate-800">Resumo da compra</p>
            <div className="mt-3 space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">
                    {item.qty}x {item.title}
                  </span>
                  <strong className="text-slate-900">{formatBRL(item.price * item.qty)}</strong>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t pt-3">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Total</span>
                <span>{formatBRL(total)}</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="space-y-5 rounded-2xl bg-white p-6" aria-label={step === 'address' ? 'Endereco de entrega' : 'Pagamento via PIX'}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">Etapa {stepNumber} de 2</Badge>
            {step === 'address' ? (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">Endereco</span>
            ) : (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">Pagamento PIX</span>
            )}
          </div>

          {step === 'address' ? (
            <div className="space-y-4" data-testid="address-step">
              <div>
                <h2 className="font-display text-2xl font-semibold">Dados de entrega</h2>
                <p className="mt-1 text-sm text-muted-foreground">Preencha endereco para liberar o pagamento.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-cep" className="mb-1 block text-sm font-semibold">
                    CEP
                  </label>
                  <Input
                    id="checkout-cep"
                    name="cep"
                    placeholder="00000-000"
                    value={address.cep}
                    onChange={(event) => handleAddressFieldChange('cep', toCepMask(event.target.value))}
                    autoComplete="postal-code"
                    aria-label="CEP"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="checkout-street" className="mb-1 block text-sm font-semibold">
                    Rua
                  </label>
                  <Input
                    id="checkout-street"
                    name="street"
                    placeholder="Rua e bairro"
                    value={address.street}
                    onChange={(event) => handleAddressFieldChange('street', event.target.value)}
                    autoComplete="address-line1"
                    aria-label="Rua"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-number" className="mb-1 block text-sm font-semibold">
                    Numero
                  </label>
                  <Input
                    id="checkout-number"
                    name="number"
                    placeholder="123"
                    value={address.number}
                    onChange={(event) => handleAddressFieldChange('number', event.target.value)}
                    aria-label="Numero"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-complement" className="mb-1 block text-sm font-semibold">
                    Complemento
                  </label>
                  <Input
                    id="checkout-complement"
                    name="complement"
                    placeholder="Apto, bloco, referencia"
                    value={address.complement ?? ''}
                    onChange={(event) => handleAddressFieldChange('complement', event.target.value)}
                    autoComplete="address-line2"
                    aria-label="Complemento"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-city" className="mb-1 block text-sm font-semibold">
                    Cidade
                  </label>
                  <Input
                    id="checkout-city"
                    name="city"
                    placeholder="Cidade"
                    value={address.city}
                    onChange={(event) => handleAddressFieldChange('city', event.target.value)}
                    autoComplete="address-level2"
                    aria-label="Cidade"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-state" className="mb-1 block text-sm font-semibold">
                    Estado (UF)
                  </label>
                  <Input
                    id="checkout-state"
                    name="state"
                    placeholder="SP"
                    value={address.state}
                    onChange={(event) => handleAddressFieldChange('state', normalizeState(event.target.value))}
                    autoComplete="address-level1"
                    maxLength={2}
                    aria-label="Estado"
                  />
                </div>
              </div>

              {cepStatus !== 'idle' && (
                <p
                  role="status"
                  className={`rounded-md px-3 py-2 text-xs ${
                    cepStatus === 'error'
                      ? 'bg-amber-50 text-amber-800'
                      : cepStatus === 'success'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-sky-50 text-sky-800'
                  }`}
                >
                  {cepMessage}
                </p>
              )}

              <Button type="button" className="w-full" onClick={() => setStep('pix')} disabled={!isAddressValid || cepStatus === 'loading'}>
                Continuar para pagamento
              </Button>
            </div>
          ) : (
            <div className="space-y-4" data-testid="pix-step">
              <div>
                <h2 className="font-display text-2xl font-semibold">Pagamento via PIX</h2>
                <p className="mt-1 text-sm text-muted-foreground">Confira os dados e confirme o pedido.</p>
              </div>

              <PixDisplay pixCode={STATIC_PIX_KEY} total={total} />

              <div className="rounded-xl border bg-muted/40 p-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t pt-2 font-semibold text-slate-900">
                  <span>Total</span>
                  <span>{formatBRL(total)}</span>
                </div>
              </div>

              {error ? (
                <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <Button type="button" className="w-full" onClick={handleConfirm} disabled={isLoading}>
                {isLoading ? 'Confirmando...' : 'Confirmar pedido'}
                {!isLoading ? <CheckCircle2 size={16} /> : null}
              </Button>

              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep('address')} disabled={isLoading}>
                Voltar para endereco
              </Button>
            </div>
          )}
        </Card>
      </section>
    </main>
  );
}