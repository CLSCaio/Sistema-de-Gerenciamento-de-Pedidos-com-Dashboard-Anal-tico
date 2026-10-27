import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Report } from '@/types/api';
import { statusLabels } from '@/utils/labels';

export function StatusChart({ report }: { report: Report }) {
  const data = report.ordersByStatus.map((entry) => ({ name: statusLabels[entry.status], total: entry.count }));
  return (
    <div className="h-80 rounded-3xl bg-white p-4">
      <h2 className="mb-3 font-display text-2xl">Pedidos por status</h2>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="total" fill="#e25b1a" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
