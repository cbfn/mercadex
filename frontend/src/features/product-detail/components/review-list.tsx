import { Star } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import type { ApiReview } from '@/shared/lib/api/reviews';

interface ReviewListProps {
  reviews: ApiReview[];
}

/**
 * Lista de avaliações de um produto com média calculada localmente.
 * Componente puramente presentacional — sem side effects.
 *
 * @example
 * <ReviewList reviews={reviews} />
 */
export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma avaliação ainda. Seja o primeiro a avaliar.
      </p>
    );
  }

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section aria-label="Avaliações do produto" className="space-y-4">
      <div className="flex items-center gap-2">
        <Star size={16} className="fill-amber-400 text-amber-400" aria-hidden="true" />
        <span className="font-semibold text-slate-900">{avg.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">({reviews.length} avaliações)</span>
      </div>

      <ul className="space-y-3">
        {reviews.map((review) => (
          <li key={review.id} className="rounded-xl border bg-card p-4 space-y-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-semibold text-slate-900">{review.title}</span>
              <Badge variant="info">{review.rating}/5</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{review.body}</p>
            <p className="text-xs text-muted-foreground">
              {review.user.name ?? 'Usuário'} · {new Date(review.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
