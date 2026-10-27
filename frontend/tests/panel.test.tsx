import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrderStatusActions } from '@/components/orders/OrderStatusActions';
import { ProductForm } from '@/components/products/ProductForm';

describe('interações do painel', () => {
  it('valida o nome do produto enquanto o usuário digita', async () => {
    const user = userEvent.setup();
    render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    await user.type(screen.getByLabelText('Nome'), 'ab');
    expect(await screen.findByText('Nome deve ter entre 3 e 120 caracteres')).toBeInTheDocument();
  });

  it('dispara a transição de status ao clicar em iniciar preparo', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OrderStatusActions status="pending" couriers={[]} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Iniciar preparo' }));
    expect(onChange).toHaveBeenCalledWith('preparing', undefined);
  });
});
