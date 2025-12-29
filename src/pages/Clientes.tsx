import { useState } from "react";
import { Plus, Search, Filter, MoreVertical, Phone, Mail, Calendar } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalVisits: number;
  lastVisit: string;
  status: "active" | "inactive" | "new";
}

const clients: Client[] = [
  { id: "1", name: "Maria Silva", email: "maria@email.com", phone: "(11) 99999-1111", totalVisits: 24, lastVisit: "Há 3 dias", status: "active" },
  { id: "2", name: "João Santos", email: "joao@email.com", phone: "(11) 99999-2222", totalVisits: 12, lastVisit: "Há 1 semana", status: "active" },
  { id: "3", name: "Ana Costa", email: "ana@email.com", phone: "(11) 99999-3333", totalVisits: 8, lastVisit: "Há 2 dias", status: "active" },
  { id: "4", name: "Pedro Lima", email: "pedro@email.com", phone: "(11) 99999-4444", totalVisits: 3, lastVisit: "Há 2 semanas", status: "inactive" },
  { id: "5", name: "Carla Oliveira", email: "carla@email.com", phone: "(11) 99999-5555", totalVisits: 1, lastVisit: "Hoje", status: "new" },
  { id: "6", name: "Lucas Mendes", email: "lucas@email.com", phone: "(11) 99999-6666", totalVisits: 15, lastVisit: "Há 5 dias", status: "active" },
  { id: "7", name: "Fernanda Souza", email: "fernanda@email.com", phone: "(11) 99999-7777", totalVisits: 6, lastVisit: "Há 1 mês", status: "inactive" },
  { id: "8", name: "Ricardo Alves", email: "ricardo@email.com", phone: "(11) 99999-8888", totalVisits: 2, lastVisit: "Ontem", status: "new" },
];

const statusConfig = {
  active: { label: "Ativo", className: "bg-success/10 text-success" },
  inactive: { label: "Inativo", className: "bg-muted text-muted-foreground" },
  new: { label: "Novo", className: "bg-primary/10 text-primary" },
};

export default function Clientes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || client.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout 
      title="Clientes" 
      subtitle="Gerencie sua base de clientes"
    >
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border animate-slide-up">
            <p className="text-sm text-muted-foreground">Total de Clientes</p>
            <p className="text-2xl font-bold text-foreground">{clients.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border animate-slide-up" style={{ animationDelay: "50ms" }}>
            <p className="text-sm text-muted-foreground">Clientes Ativos</p>
            <p className="text-2xl font-bold text-success">{clients.filter(c => c.status === "active").length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border animate-slide-up" style={{ animationDelay: "100ms" }}>
            <p className="text-sm text-muted-foreground">Novos Este Mês</p>
            <p className="text-2xl font-bold text-primary">{clients.filter(c => c.status === "new").length}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar clientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="new">Novos</option>
            </select>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* Client List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Cliente</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground hidden md:table-cell">Contato</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground hidden lg:table-cell">Visitas</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClients.map((client, index) => (
                  <tr 
                    key={client.id}
                    className="hover:bg-muted/30 transition-colors animate-slide-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{client.name}</p>
                          <p className="text-sm text-muted-foreground md:hidden">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3.5 h-3.5" />
                          {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium text-foreground">{client.totalVisits}</span>
                          <span className="text-muted-foreground">visitas</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Última: {client.lastVisit}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium",
                        statusConfig[client.status].className
                      )}>
                        {statusConfig[client.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="secondary" size="sm">
                          Agendar
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
