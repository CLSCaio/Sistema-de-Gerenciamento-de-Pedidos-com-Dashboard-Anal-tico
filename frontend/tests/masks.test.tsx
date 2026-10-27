import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CourierForm } from '@/components/couriers/CourierForm';
import { ProductForm } from '@/components/products/ProductForm';
import { dateRangeError, maskDecimal, maskInteger, maskMoney, maskPhone, parseMoney } from '@/utils/masks';
import { customerOrderSchema, productSchema } from '@/utils/validation';

describe('máscaras de formulário', () => {
  it('formata telefone, preço, coordenada e inteiro', () => {
    expect(maskPhone('11988880000')).toBe('(11) 98888-0000');
    expect(maskPhone('(11) 98888-0000')).toBe('(11) 98888-0000');
    expect(maskMoney('1990')).toBe('19,90');
    expect(parseMoney('1.990,50')).toBe(1990.5);
    expect(maskDecimal('-23,55041')).toBe('-23.55041');
    expect(maskDecimal('abc')).toBe('');
    expect(maskInteger('12a9', 2)).toBe('12');
    expect(dateRangeError('2026-10-27', '2026-10-01')).toBe('A data inicial não pode ser maior que a final');
    expect(dateRangeError('2026-10-01', '2026-10-27')).toBeUndefined();
  });

  it('rejeita telefone incompleto e coordenada vazia', () => {
    const parsed = customerOrderSchema.safeParse({
      customerName: 'Ana Souza',
      customerPhone: '(11) 9888',
      deliveryAddress: 'Rua das Flores, 100',
      latitude: '',
      longitude: '-46.63',
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue) => issue.message);
      expect(messages).toContain('Telefone deve estar no formato (XX) XXXXX-XXXX');
      expect(messages).toContain('Latitude inválida');
    }
  });

  it('aceita preço mascarado', () => {
    const parsed = productSchema.safeParse({
      name: 'Bowl de frango',
      description: 'Frango grelhado com arroz e salada.',
      price: '19,90',
      category: 'meal',
      imageUrl: '',
      isAvailable: true,
      preparationTime: '15',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.price).toBe(19.9);
  });

  it('aplica a máscara de telefone no cadastro do entregador', async () => {
    const user = userEvent.setup();
    render(<CourierForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const phone = screen.getByLabelText('Telefone');
    await user.type(phone, '11988880000');
    expect(phone).toHaveValue('(11) 98888-0000');
    await user.clear(phone);
    await user.type(phone, '119');
    await user.tab();
    expect(screen.getByText('Telefone deve estar no formato (XX) XXXXX-XXXX')).toBeInTheDocument();
  });

  it('aplica a máscara de preço no produto', async () => {
    const user = userEvent.setup();
    render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const price = screen.getByLabelText('Preço');
    await user.type(price, '1990');
    expect(price).toHaveValue('19,90');
  });
});
