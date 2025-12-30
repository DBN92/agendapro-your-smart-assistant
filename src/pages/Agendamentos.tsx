import { useEffect, useMemo, useRef, useState } from "react";
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

type Appointment = {
  id: string;
  date: string;
  startTime: string;
  durationMin: number;
  clientName: string;
  serviceId: string;
  serviceName: string;
  paid?: boolean;
};

export default function Agendamentos() {
  const [view, setView] = useState<"week" | "list">("week");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const knownIdsRef = useRef<Set<string>>(new Set());
  const apiBase = import.meta.env.VITE_API_BASE || "/api";
  const [hours, setHours] = useState<Array<{ open: boolean; start: string; end: string }>>([
    { open: true, start: "08:00", end: "18:00" },
    { open: true, start: "08:00", end: "18:00" },
    { open: true, start: "08:00", end: "18:00" },
    { open: true, start: "08:00", end: "18:00" },
    { open: true, start: "08:00", end: "18:00" },
    { open: true, start: "08:00", end: "18:00" },
    { open: false, start: "08:00", end: "18:00" },
  ]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch(`${apiBase}/appointments`);
        const body = await res.json();
        setAppointments(Array.isArray(body.appointments) ? body.appointments : []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAppointments();
  }, [apiBase]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        const h = data?.settings?.hours;
        if (Array.isArray(h) && h.length === 7) {
          setHours(h.map((d) => ({
            open: Boolean(d?.open),
            start: typeof d?.start === "string" ? d.start : "08:00",
            end: typeof d?.end === "string" ? d.end : "18:00",
          })));
        }
      } catch (_e) { /* noop */ }
    };
    fetchSettings();
  }, [apiBase]);

  useEffect(() => {
    const es = new EventSource(`${apiBase}/appointments/stream`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (Array.isArray(data.appointments)) {
          const incoming = data.appointments as Appointment[];
          const added = incoming.filter((a) => !knownIdsRef.current.has(a.id)).map((a) => a.id);
          setAppointments(incoming);
          knownIdsRef.current = new Set(incoming.map((a) => a.id));
          if (added.length) {
            setNewIds((prev) => {
              const next = new Set(prev);
              for (const id of added) next.add(id);
              return next;
            });
            for (const id of added) {
              setTimeout(() => {
                setNewIds((prev) => {
                  const next = new Set(prev);
                  next.delete(id);
                  return next;
                });
              }, 12000);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    return () => {
      es.close();
    };
  }, []);

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

  const formatDateISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
    return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
  };
  const getHoursForDayIndex = (dayIndex: number) => {
    const idx = (dayIndex + 6) % 7;
    return hours[idx];
  };
  const isWithinDayHours = (dayIndex: number, time: string) => {
    const h = getHoursForDayIndex(dayIndex);
    if (!h?.open) return false;
    const t = toMinutes(time);
    const s = toMinutes(h.start);
    const e = toMinutes(h.end);
    return t >= s && t < e;
  };
  const isAptOutOfHours = (apt: Appointment) => {
    const d = new Date(apt.date + "T00:00:00");
    const dayIndex = d.getDay();
    const h = getHoursForDayIndex(dayIndex);
    if (!h?.open) return true;
    const start = toMinutes(apt.startTime);
    const end = start + (apt.durationMin || 0);
    const hs = toMinutes(h.start);
    const he = toMinutes(h.end);
    return start < hs || end > he;
  };

  const getAppointmentStyle = (time: string, durationMin: number) => {
    const [hh, mm] = time.split(":").map((x) => parseInt(x, 10));
    const hourLabel = `${String(hh).padStart(2, "0")}:00`;
    const baseIndex = timeSlots.indexOf(hourLabel);
    const top = (baseIndex >= 0 ? baseIndex : 0) * 64 + Math.round(((mm || 0) / 60) * 64);
    const height = Math.max(48, Math.round((durationMin / 60) * 64) - 4);
    return { top: `${top}px`, height: `${height}px` };
  };

  const weekAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const dateObj = new Date(apt.date + "T00:00:00");
      const start = new Date(currentWeek);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return dateObj >= start && dateObj <= end;
    });
  }, [appointments, currentWeek]);

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
                      className={cn(
                        "h-16 border-b border-border transition-colors",
                        isWithinDayHours(dayIndex, time)
                          ? "hover:bg-muted/30 cursor-pointer"
                          : "bg-muted/20 opacity-60"
                      )}
                    />
                  ))}
                  
                  {/* Appointments */}
                  {weekAppointments
                    .filter((apt) => apt.date === formatDateISO(weekDates[dayIndex]))
                    .map((apt) => (
                      <div
                        key={apt.id}
                        className={cn(
                          "absolute left-1 right-1 gradient-primary rounded-lg p-2 cursor-pointer hover:shadow-md transition-shadow animate-scale-in relative",
                          isAptOutOfHours(apt) && "ring-2 ring-destructive"
                        )}
                        style={getAppointmentStyle(apt.startTime, apt.durationMin)}
                      >
                        <p className="text-xs font-semibold text-primary-foreground truncate">
                          {apt.clientName}
                        </p>
                        <p className="text-xs text-primary-foreground/80 truncate">
                          {apt.serviceName}
                        </p>
                        {newIds.has(apt.id) && (
                          <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground shadow">
                            Novo
                          </span>
                        )}
                        {isAptOutOfHours(apt) && (
                          <span className="absolute -top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground shadow">
                            Fora
                          </span>
                        )}
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
                    {apt.clientName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <p className="font-medium text-foreground">{apt.clientName}</p>
                  <p className="text-sm text-muted-foreground">{apt.serviceName}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-foreground">{apt.startTime}</p>
                  <p className="text-sm text-muted-foreground">{new Date(apt.date + "T00:00:00").toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}</p>
                </div>
                
                {apt.paid ? (
                  <Button variant="secondary" size="sm">Pago</Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={async () => {
                      try {
                        const res = await fetch(`${apiBase}/appointments/${apt.id}/pay`, { method: "PUT" });
                        const body = await res.json();
                        if (body?.appointment) {
                          setAppointments((prev) => prev.map((x) => (x.id === apt.id ? body.appointment : x)));
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  >
                    Marcar Pago
                  </Button>
                )}

                {newIds.has(apt.id) && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground">
                    Novo
                  </span>
                )}
                {isAptOutOfHours(apt) && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground">
                    Fora do horário
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
