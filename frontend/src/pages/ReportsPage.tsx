import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/reports/MetricCard';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { StatusChart } from '@/components/reports/StatusChart';
import { TopProductsChart } from '@/components/reports/TopProductsChart';
import { EmptyState, Notice, PageHeader } from '@/components/ui/Feedback';
import { Spinner } from '@/components/ui/Spinner';
import { ApiError } from '@/services/http';
import { getReport } from '@/services/resources';
import type { Report } from '@/types/api';
import { defaultReportRange, formatMoney } from '@/utils/labels';
import { dateRangeError } from '@/utils/masks';

export function ReportsPage() {
  const initial = defaultReportRange();
  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apply();
  }, []);

  async function apply(start = startDate, end = endDate) {
    if (dateRangeError(start, end)) return;
    setLoading(true);
    try {
      setReport(await getReport(start, end));
      setError(null);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível carregar o relatório');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid gap-6">
      <PageHeader title="Relatórios" description="Receita, status, produtos e tempo médio consideram o período selecionado." />
      <ReportFilters startDate={startDate} endDate={endDate} onChange={(start, end) => { setStartDate(start); setEndDate(end); }} onApply={() => void apply()} />
      {error ? <Notice>{error}</Notice> : null}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : report ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard label="Receita entregue" value={formatMoney(report.revenue.total)} />
            <MetricCard
              label="Tempo médio de entrega"
              value={report.averageDeliveryTimeMinutes === null ? 'Sem dados' : `${report.averageDeliveryTimeMinutes} min`}
            />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <StatusChart report={report} />
            <TopProductsChart report={report} />
          </div>
        </>
      ) : (
        <EmptyState>Escolha o período e atualize para ver as métricas.</EmptyState>
      )}
    </section>
  );
}
