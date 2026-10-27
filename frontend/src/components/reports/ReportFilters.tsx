import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { dateRangeError } from '@/utils/masks';

export function ReportFilters({
  startDate,
  endDate,
  onChange,
  onApply,
}: {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  onApply: () => void;
}) {
  const rangeError = dateRangeError(startDate, endDate);
  return (
    <form
      className="grid gap-3 rounded-3xl bg-white p-4 md:grid-cols-[1fr_1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        if (!rangeError) onApply();
      }}
    >
      <Field label="Início" htmlFor="report-start" error={rangeError}>
        <Input id="report-start" type="date" value={startDate} invalid={Boolean(rangeError)} onChange={(event) => onChange(event.target.value, endDate)} />
      </Field>
      <Field label="Fim" htmlFor="report-end">
        <Input id="report-end" type="date" value={endDate} invalid={Boolean(rangeError)} onChange={(event) => onChange(startDate, event.target.value)} />
      </Field>
      <div className="flex items-end">
        <Button type="submit">Atualizar</Button>
      </div>
    </form>
  );
}
