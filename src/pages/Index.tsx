import { Calendar, Users, TrendingUp, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AppointmentsList } from "@/components/dashboard/AppointmentsList";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

const stats = [
  { 
    title: "Agendamentos Hoje", 
    value: "12", 
    change: "+3 vs ontem",
    changeType: "positive" as const,
    icon: Calendar 
  },
  { 
    title: "Clientes Ativos", 
    value: "248", 
    change: "+18 este mês",
    changeType: "positive" as const,
    icon: Users 
  },
  { 
    title: "Receita Mensal", 
    value: "R$ 8.420", 
    change: "+12% vs mês anterior",
    changeType: "positive" as const,
    icon: TrendingUp 
  },
  { 
    title: "Próximo Horário", 
    value: "09:00", 
    change: "Em 25 minutos",
    changeType: "neutral" as const,
    icon: Clock 
  },
];

export default function Index() {
  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle="Bem-vindo de volta! Aqui está o resumo do seu dia."
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={stat.title} style={{ animationDelay: `${index * 75}ms` }}>
              <StatsCard {...stat} />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Charts and Lists */}
        <div className="grid lg:grid-cols-2 gap-6">
          <AppointmentsList />
          <RevenueChart />
        </div>
      </div>
    </DashboardLayout>
  );
}
