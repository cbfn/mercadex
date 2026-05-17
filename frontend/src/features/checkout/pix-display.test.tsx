import { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PixDisplay } from './pix-display';

describe('PixDisplay', () => {
  beforeEach(() => {
    Object.defineProperty(global.navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renderiza valor total e chave PIX', () => {
    render(<PixDisplay pixCode="000201TESTEPIX" total={1499.9} />);

    expect(screen.getByText('Total do PIX')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.499,90')).toBeInTheDocument();
    expect(screen.getByText('000201TESTEPIX')).toBeInTheDocument();
  });

  it('renderiza QR code com URL codificada', () => {
    render(<PixDisplay pixCode="pix chave com espaco" total={10} />);

    const qrImage = screen.getByRole('img', { name: 'QR code PIX' });
    expect(qrImage).toHaveAttribute(
      'src',
      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pix%20chave%20com%20espaco',
    );
  });

  it('copia chave para clipboard e mostra feedback temporario', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const writeText = jest.spyOn(global.navigator.clipboard, 'writeText');

    render(<PixDisplay pixCode="000201TESTEPIX" total={10} />);

    await user.click(screen.getByRole('button', { name: 'Copiar chave PIX' }));

    expect(writeText).toHaveBeenCalledWith('000201TESTEPIX');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copiar chave PIX' })).toHaveTextContent('Copiado!');
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('button', { name: 'Copiar chave PIX' })).toHaveTextContent('Copiar chave PIX');
  });
});
