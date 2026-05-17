'use client';

import { useState } from 'react';
import { formatBRL } from '@/shared/lib/currency';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

interface PixDisplayProps {
  pixCode: string;
  total: number;
}

/**
 * Exibe a chave PIX estática, QR code (via API externa) e botão de cópia.
 */
export function PixDisplay({ pixCode, total }: PixDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`;

  return (
    <Card className="rounded-xl border-dashed p-4">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Total do PIX</p>
        <p className="font-display text-3xl font-bold text-slate-900">{formatBRL(total)}</p>
        <p className="text-sm text-muted-foreground">Escaneie o QR code ou copie a chave abaixo para pagar.</p>

        <div className="flex justify-center rounded-lg border bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="QR code PIX" width={200} height={200} />
        </div>

        <div className="rounded-lg bg-muted p-3">
          <code className="block break-all text-xs text-slate-700">{pixCode}</code>
        </div>

        <Button type="button" variant="secondary" className="w-full" onClick={handleCopy} aria-label="Copiar chave PIX">
          {copied ? 'Copiado!' : 'Copiar chave PIX'}
        </Button>
      </div>
    </Card>
  );
}