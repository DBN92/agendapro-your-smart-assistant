import { useState } from "react";
import { Plus, Filter, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const appointments = [
  { id: 1, client: "Maria Silva", service: "Corte", time: "09:00", duration: 1, day: 1 },
  { id: 2, client: "João Santos", service: "Barba", time: "10:00", duration: 1, day: 1 },
  { id: 3, client: "Ana Costa", service: "Coloração", time: "14:00", duration: 2, day: 2 },
  { id: 4, client: "Pedro Lima", service: "Corte + Barba", time: "11:00", duration: 1, day: 3 },
  { id: 5, client: "Carla Oliveira", service: "Hidratação", time: "15:00", duration: 2, day: 4 },
  { id: 6, client: "Lucas Mendes", service: "Corte", time: "09:00", duration: 1, day: 5 },
];

export default function Agendamentos() {
  const [view, setView] = useState<"week" | "list">("week");
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const getWeekDates = () => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const getAppointmentStyle = (time: string, duration: number) => {
    const startIndex = timeSlots.indexOf(time);
    return {
      top: `${startIndex * 64}px`,
      height: `${duration * 64 - 4}px`,
    };
  };

  return (
    <DashboardLayout 
      title="Agendamentos" 
      subtitle="Gerencie sua agenda e horários"
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant={view === "week" ? "default" : "secondary"} 
              size="sm"
              onClick={() => setView("week")}
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              Semana
            </Button>
            <Button 
              variant={view === "list" ? "default" : "secondary"} 
              size="sm"
              onClick={() => setView("list")}
            >
              <List className="w-4 h-4 mr-1" />
              Lista
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon-sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-3">
              {weekDates[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - {weekDates[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
            </span>
            <Button variant="secondary" size="icon-sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filtrar
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        {/* Calendar Week View */}
        {view === "week" && (
          <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="grid grid-cols-8 border-b border-border">
              <div className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border">
                Horário
              </div>
              {weekDates.map((date, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-3 text-center border-r border-border last:border-r-0",
                    date.toDateString() === new Date().toDateString() && "bg-primary/5"
                  )}
                >
                  <p className="text-xs text-muted-foreground">{weekDays[i]}</p>
                  <p className={cn(
                    "text-lg font-semibold",
                    date.toDateString() === new Date().toDateString() 
                      ? "text-primary" 
                      : "text-foreground"
                  )}>
                    {date.getDate()}
                  </p>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="grid grid-cols-8 relative">
              {/* Time Column */}
              <div className="border-r border-border">
                {timeSlots.map((time) => (
                  <div 
                    key={time}
                    className="h-16 px-3 flex items-start justify-end pt-1 text-xs text-muted-foreground border-b border-border"
                  >
                    {time}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {weekDates.map((date, dayIndex) => (
                <div key={dayIndex} className="relative border-r border-border last:border-r-0">
                  {timeSlots.map((time) => (
                    <div 
                      key={time}
                      className="h-16 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    />
                  ))}
                  
                  {/* Appointments */}
                  {appointments
                    .filter(apt => apt.day === dayIndex)
                    .map((apt) => (
                      <div
                        key={apt.id}
                        className="absolute left-1 right-1 gradient-primary rounded-lg p-2 cursor-pointer hover:shadow-md transition-shadow animate-scale-in"
                        style={getAppointmentStyle(apt.time, apt.duration)}
                      >
                        <p className="text-xs font-semibold text-primary-foreground truncate">
                          {apt.client}
                        </p>
                        <p className="text-xs text-primary-foreground/80 truncate">
                          {apt.service}
                        </p>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="bg-card rounded-xl border border-border divide-y divide-border animate-fade-in">
            {appointments.map((apt, index) => (
              <div 
                key={apt.id}
                className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {apt.client.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <p className="font-medium text-foreground">{apt.client}</p>
                  <p className="text-sm text-muted-foreground">{apt.service}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-foreground">{apt.time}</p>
                  <p className="text-sm text-muted-foreground">
                    {weekDates[apt.day]?.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}
                  </p>
                </div>
                
                <Button variant="secondary" size="sm">Detalhes</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
