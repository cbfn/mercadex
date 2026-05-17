import { render, screen } from '@testing-library/react';
import { ReviewList } from './review-list';
import type { ApiReview } from '@/shared/lib/api/reviews';

const makeReview = (overrides: Partial<ApiReview> = {}): ApiReview => ({
  id: 'r1',
  title: 'Ótimo produto',
  body: 'Funcionou perfeitamente.',
  rating: 5,
  user: { id: 'u1', name: 'Maria' },
  createdAt: '2026-05-01T10:00:00.000Z',
  ...overrides,
});

describe('ReviewList', () => {
  it('exibe mensagem de estado vazio quando não há avaliações', () => {
    render(<ReviewList reviews={[]} />);
    expect(screen.getByText(/nenhuma avaliação ainda/i)).toBeInTheDocument();
  });

  it('exibe média e contagem quando há avaliações', () => {
    const reviews = [
      makeReview({ id: 'r1', rating: 4 }),
      makeReview({ id: 'r2', rating: 2 }),
    ];
    render(<ReviewList reviews={reviews} />);

    expect(screen.getByText('3.0')).toBeInTheDocument();
    expect(screen.getByText(/2 avaliações/i)).toBeInTheDocument();
  });

  it('renderiza título, corpo e nome do autor de cada avaliação', () => {
    const reviews = [
      makeReview({ id: 'r1', title: 'Excelente', body: 'Muito bom mesmo.', user: { id: 'u1', name: 'Ana' } }),
      makeReview({ id: 'r2', title: 'Razoável', body: 'Poderia ser melhor.', user: { id: 'u2', name: 'Pedro' } }),
    ];
    render(<ReviewList reviews={reviews} />);

    expect(screen.getByText('Excelente')).toBeInTheDocument();
    expect(screen.getByText('Muito bom mesmo.')).toBeInTheDocument();
    expect(screen.getByText(/Ana/)).toBeInTheDocument();

    expect(screen.getByText('Razoável')).toBeInTheDocument();
    expect(screen.getByText('Poderia ser melhor.')).toBeInTheDocument();
    expect(screen.getByText(/Pedro/)).toBeInTheDocument();
  });

  it('renderiza badge de nota para cada avaliação', () => {
    const reviews = [makeReview({ id: 'r1', rating: 4 })];
    render(<ReviewList reviews={reviews} />);
    expect(screen.getByText('4/5')).toBeInTheDocument();
  });

  it('exibe "Usuário" quando o nome do autor é null', () => {
    const reviews = [makeReview({ user: { id: 'u1', name: null } })];
    render(<ReviewList reviews={reviews} />);
    expect(screen.getByText(/Usuário/)).toBeInTheDocument();
  });
});
