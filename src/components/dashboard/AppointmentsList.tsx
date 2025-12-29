import { Clock, User, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
}

const appointments: Appointment[] = [
  { id: "1", clientName: "Maria Silva", service: "Corte de Cabelo", time: "09:00", status: "confirmed" },
  { id: "2", clientName: "João Santos", service: "Barba", time: "10:30", status: "pending" },
  { id: "3", clientName: "Ana Costa", service: "Coloração", time: "11:00", status: "confirmed" },
  { id: "4", clientName: "Pedro Lima", service: "Corte + Barba", time: "14:00", status: "pending" },
  { id: "5", clientName: "Carla Oliveira", service: "Hidratação", time: "15:30", status: "confirmed" },
];

const statusConfig = {
  confirmed: { label: "Confirmado", className: "bg-success/10 text-success" },
  pending: { label: "Pendente", className: "bg-warning/10 text-warning" },
  completed: { label: "Concluído", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelado", className: "bg-destructive/10 text-destructive" },
};

export function AppointmentsList() {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border animate-slide-up">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Agendamentos de Hoje</h3>
          <Button variant="ghost" size="sm">Ver todos</Button>
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {appointments.map((appointment, index) => (
          <div 
            key={appointment.id}
            className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Avatar className="h-10 w-10 border border-border">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                {appointment.clientName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {appointment.clientName}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {appointment.service}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {appointment.time}
            </div>
            
            <span className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium",
              statusConfig[appointment.status].className
            )}>
              {statusConfig[appointment.status].label}
            </span>
            
            <Button variant="ghost" size="icon-sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
