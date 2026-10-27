export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl bg-ink px-5 py-4 text-cream">
      <p className="text-sm text-orange-100">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </article>
  );
}
