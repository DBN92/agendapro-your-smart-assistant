import { Calendar, UserPlus, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { 
    icon: Calendar, 
    label: "Novo Agendamento", 
    description: "Agende um horário",
    gradient: "gradient-primary"
  },
  { 
    icon: MessageSquare, 
    label: "Enviar Lembrete", 
    description: "Notifique clientes",
    gradient: "bg-success"
  },
  { 
    icon: Settings, 
    label: "Configurar", 
    description: "Ajuste o sistema",
    gradient: "bg-secondary"
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <button
          key={action.label}
          className={cn(
            "p-4 rounded-xl text-left transition-all duration-200",
            "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
            "animate-slide-up",
            action.gradient,
            action.gradient.includes("gradient") || action.gradient === "bg-success"
              ? "text-primary-foreground" 
              : "text-secondary-foreground"
          )}
          style={{ animationDelay: `${index * 75}ms` }}
        >
          <action.icon className="w-6 h-6 mb-3" />
          <p className="font-semibold">{action.label}</p>
          <p className={cn(
            "text-sm mt-0.5",
            action.gradient.includes("gradient") || action.gradient === "bg-success"
              ? "opacity-80" 
              : "text-muted-foreground"
          )}>
            {action.description}
          </p>
        </button>
      ))}
    </div>
  );
}
