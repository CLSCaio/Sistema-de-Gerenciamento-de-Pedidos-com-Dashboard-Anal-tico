import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Report } from '@/types/api';

export function TopProductsChart({ report }: { report: Report }) {
  const data = report.topProducts.map((product) => ({ name: product.name, quantidade: product.quantity }));
  return (
    <div className="h-80 rounded-3xl bg-white p-4">
      <h2 className="mb-3 font-display text-2xl">Mais vendidos</h2>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="quantidade" fill="#1f6b4a" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
