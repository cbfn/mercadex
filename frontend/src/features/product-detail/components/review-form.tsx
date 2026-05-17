'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/features/auth/model/auth-context';
import { reviewsApi } from '@/shared/lib/api/reviews';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/cn';

interface ReviewFormProps {
  productId: string;
  /** Chamado após envio bem-sucedido para que o pai recarregue a lista. */
  onSuccess: () => void;
}

/**
 * Formulário autenticado para submissão de avaliação de produto.
 * Renderiza nada quando o usuário não está autenticado
 * (o componente pai exibe o CTA de login nesses casos).
 *
 * @example
 * <ReviewForm productId={product.id} onSuccess={refreshReviews} />
 */
export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await reviewsApi.create(productId, { rating, title, body });
      setRating(5);
      setTitle('');
      setBody('');
      onSuccess();
    } catch {
      setError('Não foi possível enviar a avaliação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Formulário de avaliação" className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="review-rating" className="text-sm font-semibold text-foreground">
          Nota (1–5)
        </label>
        <Input
          id="review-rating"
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="review-title" className="text-sm font-semibold text-foreground">
          Título
        </label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resuma sua experiência"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="review-body" className="text-sm font-semibold text-foreground">
          Comentário
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Conte mais detalhes sobre o produto..."
          required
          rows={3}
          disabled={isLoading}
          className={cn(
            'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Enviando...' : 'Enviar avaliação'}
      </Button>
    </form>
  );
}
