import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  Settings, 
  LayoutDashboard, 
  CreditCard, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Calendar, label: "Agendamentos", path: "/agendamentos" },
  { icon: Sparkles, label: "Serviços", path: "/servicos" },
  { icon: MessageSquare, label: "Assistente IA", path: "/assistente" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "sidebar-glass shadow-glow border-r border-sidebar-border/60 flex flex-col transition-all duration-300 ease-in-out rounded-r-xl",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border/60">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-lg gradient-primary shadow-glow flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">
              AgendaPro
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? "sidebar-active" : "sidebar"}
                size="default"
                className={cn(
                  "w-full relative group",
                  collapsed ? "justify-center px-2" : "justify-start px-3",
                  isActive ? "shadow-glow" : "hover:bg-sidebar-accent"
                )}
              >
                {!collapsed && (
                  <span
                    className={cn(
                      "absolute left-1.5 h-5 w-1 rounded-full bg-sidebar-primary transition-opacity",
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                    )}
                  />
                )}
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border/60">
          <div className="rounded-lg bg-sidebar-accent p-3 animate-fade-in">
            <p className="text-xs text-sidebar-foreground mb-2">
              Plano Profissional
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-sidebar-border/60 rounded-full overflow-hidden">
                <div className="h-full w-3/4 gradient-accent rounded-full" />
              </div>
              <span className="text-xs font-medium text-sidebar-primary">75%</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
