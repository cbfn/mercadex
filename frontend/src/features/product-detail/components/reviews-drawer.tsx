'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Drawer } from '@/shared/ui/drawer';
import { Button } from '@/shared/ui/button';
import { useAuth } from '@/features/auth/model/auth-context';
import { reviewsApi, type ApiReview } from '@/shared/lib/api/reviews';
import { ReviewList } from './review-list';
import { ReviewForm } from './review-form';

interface ReviewsDrawerProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
}

/**
 * Drawer de avaliações de um produto.
 * Busca reviews ao abrir e permite criar novas avaliações quando autenticado.
 * Usuários não autenticados são redirecionados para login com retorno ao produto.
 *
 * @example
 * <ReviewsDrawer open={open} onClose={onClose} productId={id} productTitle={title} />
 */
export function ReviewsDrawer({ open, onClose, productId, productTitle }: ReviewsDrawerProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reviewsApi.list(productId);
      setReviews(res.data);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (open) {
      void fetchReviews();
      setShowForm(false);
    }
  }, [open, fetchReviews]);

  const handleSuccess = useCallback(async () => {
    setShowForm(false);
    await fetchReviews();
  }, [fetchReviews]);

  const handleLoginRedirect = () => {
    const returnTo = encodeURIComponent(`/products/${productId}?reviews=open`);
    router.push(`/login?redirect=${returnTo}`);
  };

  return (
    <Drawer open={open} title={`Avaliações — ${productTitle}`} onClose={onClose}>
      <div className="space-y-6">
        {loading ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Carregando avaliações...
          </p>
        ) : (
          <ReviewList reviews={reviews} />
        )}

        <div className="border-t border-border pt-4 space-y-3">
          {user ? (
            showForm ? (
              <ReviewForm productId={productId} onSuccess={handleSuccess} />
            ) : (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowForm(true)}
                data-testid="show-review-form-button"
              >
                Escrever avaliação
              </Button>
            )
          ) : (
            <div className="rounded-xl border border-dashed p-4 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Faça login para escrever uma avaliação.
              </p>
              <Button
                className="w-full"
                onClick={handleLoginRedirect}
                data-testid="login-to-review-button"
              >
                Entrar e avaliar
              </Button>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
