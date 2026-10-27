import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { DeliveryPerson, DeliveryPersonInput, VehicleType } from '@/types/api';
import { vehicleLabels } from '@/utils/labels';
import { maskDecimal, maskPhone } from '@/utils/masks';
import { courierSchema, fieldErrors } from '@/utils/validation';

interface CourierFormProps {
  initial?: DeliveryPerson;
  onSubmit: (input: DeliveryPersonInput) => Promise<void>;
  onCancel: () => void;
}

export function CourierForm({ initial, onSubmit, onCancel }: CourierFormProps) {
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    phone: initial?.phone ?? '',
    vehicleType: initial?.vehicleType ?? ('motorcycle' as VehicleType),
    isActive: initial?.isActive ?? true,
    currentLatitude: initial?.currentLatitude?.toString() ?? '',
    currentLongitude: initial?.currentLongitude?.toString() ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function touch(key: 'name' | 'phone' | 'currentLatitude' | 'currentLongitude') {
    const parsed = courierSchema.safeParse(values);
    setErrors((current) => {
      const next = { ...current };
      const message = parsed.success ? undefined : fieldErrors(parsed.error)[key];
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = courierSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    if ((parsed.data.currentLatitude === null) !== (parsed.data.currentLongitude === null)) {
      setErrors({
        currentLatitude: 'Informe as duas coordenadas ou nenhuma',
        currentLongitude: 'Informe as duas coordenadas ou nenhuma',
      });
      return;
    }
    await onSubmit(parsed.data);
  }

  return (
    <form className="grid gap-4" onSubmit={(event) => void submit(event)} noValidate>
      <Field label="Nome" htmlFor="courier-name" error={errors.name}>
        <Input id="courier-name" autoComplete="name" maxLength={100} value={values.name} invalid={Boolean(errors.name)} onChange={(event) => setValues({ ...values, name: event.target.value })} onBlur={() => touch('name')} />
      </Field>
      <Field label="Telefone" htmlFor="courier-phone" error={errors.phone}>
        <Input id="courier-phone" inputMode="numeric" autoComplete="tel" placeholder="(11) 98888-0000" maxLength={15} value={values.phone} invalid={Boolean(errors.phone)} onChange={(event) => setValues({ ...values, phone: maskPhone(event.target.value) })} onBlur={() => touch('phone')} />
      </Field>
      <Field label="Veículo" htmlFor="courier-vehicle">
        <Select id="courier-vehicle" value={values.vehicleType} onChange={(event) => setValues({ ...values, vehicleType: event.target.value as VehicleType })}>
          {Object.entries(vehicleLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Latitude atual" htmlFor="courier-lat" error={errors.currentLatitude}>
          <Input id="courier-lat" inputMode="decimal" value={values.currentLatitude} invalid={Boolean(errors.currentLatitude)} onChange={(event) => setValues({ ...values, currentLatitude: maskDecimal(event.target.value) })} onBlur={() => touch('currentLatitude')} />
        </Field>
        <Field label="Longitude atual" htmlFor="courier-lng" error={errors.currentLongitude}>
          <Input id="courier-lng" inputMode="decimal" value={values.currentLongitude} invalid={Boolean(errors.currentLongitude)} onChange={(event) => setValues({ ...values, currentLongitude: maskDecimal(event.target.value) })} onBlur={() => touch('currentLongitude')} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold" htmlFor="courier-active">
        <Checkbox id="courier-active" checked={values.isActive} onChange={(event) => setValues({ ...values, isActive: event.target.checked })} />
        Ativo
      </label>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
