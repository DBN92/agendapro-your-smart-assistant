import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState } from 'react';

interface RevenueData {
  name: string;
  previsao: number;
  real: number | null;
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([]);
  const apiBase = import.meta.env.VITE_API_BASE || "/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiBase}/revenue/weekly`);
        const body = await res.json();
        setData(Array.isArray(body.data) ? body.data : []);
      } catch (e) {
        console.error('Erro ao buscar dados de receita:', e);
      }
    };
    fetchData();
  }, [apiBase]);

  return (
    <div className="bg-card glass-strong rounded-xl shadow-sm border border-border p-5 animate-slide-up">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Receita Semanal</h3>
        <p className="text-sm text-muted-foreground">Últimos 7 dias</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorPrevisao" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `R$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
              }}
              formatter={(value: number) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']}
            />
            <Legend wrapperStyle={{ color: 'hsl(var(--muted-foreground))' }} />
            <Area
              type="monotone"
              dataKey="previsao"
              name="Previsão"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrevisao)"
            />
            <Line
              type="monotone"
              dataKey="real"
              name="Real"
              stroke="hsl(var(--success))"
              strokeWidth={2.5}
              dot={{ r: 3, stroke: 'hsl(var(--success))' }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
