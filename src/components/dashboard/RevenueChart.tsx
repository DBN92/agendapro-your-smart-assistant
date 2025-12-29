import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Seg', receita: 1200 },
  { name: 'Ter', receita: 1800 },
  { name: 'Qua', receita: 1400 },
  { name: 'Qui', receita: 2200 },
  { name: 'Sex', receita: 2800 },
  { name: 'Sáb', receita: 3200 },
  { name: 'Dom', receita: 1600 },
];

export function RevenueChart() {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-5 animate-slide-up">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Receita Semanal</h3>
        <p className="text-sm text-muted-foreground">Últimos 7 dias</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(192 75% 28%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(192 75% 28%)" stopOpacity={0}/>
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
              formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
            />
            <Area
              type="monotone"
              dataKey="receita"
              stroke="hsl(192 75% 28%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorReceita)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
