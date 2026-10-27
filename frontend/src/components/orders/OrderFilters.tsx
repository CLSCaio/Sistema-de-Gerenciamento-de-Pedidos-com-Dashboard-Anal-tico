import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { OrderStatus } from '@/types/api';
import { statusLabels } from '@/utils/labels';
import { dateRangeError } from '@/utils/masks';

export interface OrderFilterValue {
  status: '' | OrderStatus;
  startDate: string;
  endDate: string;
}

export function OrderFilters({ value, onChange }: { value: OrderFilterValue; onChange: (value: OrderFilterValue) => void }) {
  const rangeError = dateRangeError(value.startDate, value.endDate);
  return (
    <form
      className="grid gap-3 rounded-3xl bg-white p-4 md:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        onChange(value);
      }}
    >
      <Field label="Status" htmlFor="order-status">
        <Select
          id="order-status"
          value={value.status}
          onChange={(event) => onChange({ ...value, status: event.target.value as OrderFilterValue['status'] })}
        >
          <option value="">Todos</option>
          {Object.entries(statusLabels).map(([status, label]) => (
            <option key={status} value={status}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="De" htmlFor="order-start" error={rangeError}>
        <Input id="order-start" type="date" value={value.startDate} invalid={Boolean(rangeError)} onChange={(event) => onChange({ ...value, startDate: event.target.value })} />
      </Field>
      <Field label="Até" htmlFor="order-end">
        <Input id="order-end" type="date" value={value.endDate} invalid={Boolean(rangeError)} onChange={(event) => onChange({ ...value, endDate: event.target.value })} />
      </Field>
      <div className="flex items-end">
        <Button variant="secondary" onClick={() => onChange({ status: '', startDate: '', endDate: '' })}>
          Limpar
        </Button>
      </div>
    </form>
  );
}
