import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { listProducts } from '@/services/resources';
import type { Product } from '@/types/api';
import { maskDecimal, maskInteger, maskPhone } from '@/utils/masks';
import { customerOrderSchema, fieldErrors } from '@/utils/validation';

interface DraftItem {
  productId: string;
  productName: string;
  quantity: number;
}

interface CreateOrderFormProps {
  onSubmit: (input: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    latitude: number;
    longitude: number;
    items: Array<{ productId: string; quantity: number }>;
  }) => Promise<void>;
  onCancel: () => void;
}

export function CreateOrderForm({ onSubmit, onCancel }: CreateOrderFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [values, setValues] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    latitude: '-23.55',
    longitude: '-46.63',
    productId: '',
    quantity: '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    listProducts({ page: 1, pageSize: 100 }).then((page) => {
      if (active) setProducts(page.data);
    });
    return () => {
      active = false;
    };
  }, []);

  function touch(key: 'customerName' | 'customerPhone' | 'deliveryAddress' | 'latitude' | 'longitude') {
    const parsed = customerOrderSchema.safeParse(values);
    setErrors((current) => {
      const next = { ...current };
      const message = parsed.success ? undefined : fieldErrors(parsed.error)[key];
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });
  }

  function addItem() {
    const product = products.find((entry) => entry.id === values.productId);
    const quantity = Number(values.quantity);
    const nextErrors: Record<string, string> = {};
    if (!product) nextErrors.productId = 'Selecione um produto';
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) nextErrors.quantity = 'Quantidade deve ser de 1 a 99';
    const existing = product ? items.find((item) => item.productId === product.id) : undefined;
    if (product && existing && existing.quantity + quantity > 99) nextErrors.quantity = 'Quantidade máxima é 99';
    if (Object.keys(nextErrors).length > 0) {
      setErrors((current) => ({ ...current, ...nextErrors }));
      return;
    }
    if (!product) return;
    setItems((current) => {
      const found = current.find((item) => item.productId === product.id);
      if (found) {
        return current.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item));
      }
      return [...current, { productId: product.id, productName: product.name, quantity }];
    });
    setErrors((current) => ({ ...current, productId: '', items: '', quantity: '' }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = customerOrderSchema.safeParse(values);
    const nextErrors = parsed.success ? {} : fieldErrors(parsed.error);
    if (items.length === 0) nextErrors.items = 'Adicione ao menos um item';
    if (!parsed.success || items.length === 0) {
      setErrors(nextErrors);
      return;
    }
    await onSubmit({
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      deliveryAddress: parsed.data.deliveryAddress,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    });
  }

  return (
    <form className="grid gap-4" onSubmit={(event) => void submit(event)} noValidate>
      <Field label="Cliente" htmlFor="customer-name" error={errors.customerName}>
        <Input id="customer-name" autoComplete="name" maxLength={100} value={values.customerName} invalid={Boolean(errors.customerName)} onChange={(event) => setValues({ ...values, customerName: event.target.value })} onBlur={() => touch('customerName')} />
      </Field>
      <Field label="Telefone" htmlFor="customer-phone" error={errors.customerPhone}>
        <Input id="customer-phone" inputMode="numeric" autoComplete="tel" placeholder="(11) 98888-0000" maxLength={15} value={values.customerPhone} invalid={Boolean(errors.customerPhone)} onChange={(event) => setValues({ ...values, customerPhone: maskPhone(event.target.value) })} onBlur={() => touch('customerPhone')} />
      </Field>
      <Field label="Endereço" htmlFor="customer-address" error={errors.deliveryAddress}>
        <Input id="customer-address" autoComplete="street-address" maxLength={300} value={values.deliveryAddress} invalid={Boolean(errors.deliveryAddress)} onChange={(event) => setValues({ ...values, deliveryAddress: event.target.value })} onBlur={() => touch('deliveryAddress')} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Latitude" htmlFor="latitude" error={errors.latitude}>
          <Input id="latitude" inputMode="decimal" value={values.latitude} invalid={Boolean(errors.latitude)} onChange={(event) => setValues({ ...values, latitude: maskDecimal(event.target.value) })} onBlur={() => touch('latitude')} />
        </Field>
        <Field label="Longitude" htmlFor="longitude" error={errors.longitude}>
          <Input id="longitude" inputMode="decimal" value={values.longitude} invalid={Boolean(errors.longitude)} onChange={(event) => setValues({ ...values, longitude: maskDecimal(event.target.value) })} onBlur={() => touch('longitude')} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
        <Field label="Produto" htmlFor="order-product" error={errors.productId || errors.items}>
          <Select id="order-product" value={values.productId} invalid={Boolean(errors.productId || errors.items)} onChange={(event) => setValues({ ...values, productId: event.target.value })}>
            <option value="">Selecione</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Qtd" htmlFor="order-quantity" error={errors.quantity}>
          <Input id="order-quantity" inputMode="numeric" value={values.quantity} invalid={Boolean(errors.quantity)} onChange={(event) => setValues({ ...values, quantity: maskInteger(event.target.value, 2) })} />
        </Field>
        <Button variant="secondary" onClick={addItem}>
          Adicionar
        </Button>
      </div>
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm">
            <span>
              {item.quantity}x {item.productName}
            </span>
            <Button variant="ghost" onClick={() => setItems((current) => current.filter((entry) => entry.productId !== item.productId))}>
              Remover
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Criar pedido</Button>
      </div>
    </form>
  );
}
