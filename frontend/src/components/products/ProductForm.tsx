import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import type { Category, Product, ProductInput } from '@/types/api';
import { categoryLabels } from '@/utils/labels';
import { formatMoneyInput, maskInteger, maskMoney } from '@/utils/masks';
import { fieldErrors, productSchema } from '@/utils/validation';

interface ProductFormProps {
  initial?: Product;
  onSubmit: (input: ProductInput) => Promise<void>;
  onCancel: () => void;
}

const empty = {
  name: '',
  description: '',
  price: '',
  category: 'meal' as Category,
  imageUrl: '',
  isAvailable: true,
  preparationTime: '15',
};

export function ProductForm({ initial, onSubmit, onCancel }: ProductFormProps) {
  const [values, setValues] = useState({
    ...empty,
    ...(initial
      ? {
          name: initial.name,
          description: initial.description,
          price: formatMoneyInput(initial.price),
          category: initial.category,
          imageUrl: initial.imageUrl ?? '',
          isAvailable: initial.isAvailable,
          preparationTime: String(initial.preparationTime),
        }
      : {}),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function update(key: keyof typeof values, value: string | boolean) {
    const next = { ...values, [key]: value };
    setValues(next);
    const parsed = productSchema.safeParse(next);
    setErrors((current) => {
      const copy = { ...current };
      const message = parsed.success ? undefined : fieldErrors(parsed.error)[key];
      if (message) copy[key] = message;
      else delete copy[key];
      return copy;
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = productSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ ...parsed.data, imageUrl: parsed.data.imageUrl || null });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={(event) => void submit(event)} noValidate>
      <Field label="Nome" htmlFor="product-name" error={errors.name}>
        <Input id="product-name" maxLength={120} value={values.name} invalid={Boolean(errors.name)} onChange={(event) => update('name', event.target.value)} />
      </Field>
      <Field label="Descrição" htmlFor="product-description" error={errors.description}>
        <TextArea id="product-description" maxLength={500} value={values.description} invalid={Boolean(errors.description)} onChange={(event) => update('description', event.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Preço" htmlFor="product-price" error={errors.price}>
          <Input id="product-price" inputMode="decimal" placeholder="0,00" value={values.price} invalid={Boolean(errors.price)} onChange={(event) => update('price', maskMoney(event.target.value))} />
        </Field>
        <Field label="Preparo (min)" htmlFor="product-time" error={errors.preparationTime}>
          <Input id="product-time" inputMode="numeric" value={values.preparationTime} invalid={Boolean(errors.preparationTime)} onChange={(event) => update('preparationTime', maskInteger(event.target.value, 3))} />
        </Field>
      </div>
      <Field label="Categoria" htmlFor="product-category">
        <Select id="product-category" value={values.category} onChange={(event) => update('category', event.target.value)}>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="URL da imagem" htmlFor="product-image" error={errors.imageUrl}>
        <Input id="product-image" value={values.imageUrl} invalid={Boolean(errors.imageUrl)} onChange={(event) => update('imageUrl', event.target.value)} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-semibold" htmlFor="product-available">
        <Checkbox id="product-available" checked={values.isAvailable} onChange={(event) => update('isAvailable', event.target.checked)} />
        Disponível para venda
      </label>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          Salvar
        </Button>
      </div>
    </form>
  );
}
