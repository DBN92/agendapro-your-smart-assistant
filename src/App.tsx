import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Agendamentos from "./pages/Agendamentos";
import Clientes from "./pages/Clientes";
import Assinaturas from "./pages/Assinaturas";
import Assistente from "./pages/Assistente";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import Servicos from "./pages/Servicos";

const queryClient = new QueryClient();

const colorPresets = [
  { name: "Teal", primary: "192 75% 28%", accent: "38 92% 50%" },
  { name: "Azul", primary: "217 91% 50%", accent: "38 92% 50%" },
  { name: "Verde", primary: "152 60% 40%", accent: "38 92% 50%" },
  { name: "Roxo", primary: "262 83% 58%", accent: "38 92% 50%" },
  { name: "Rosa", primary: "330 81% 60%", accent: "38 92% 50%" },
];

function applyTheme(presetIndex?: number) {
  try {
    const i = typeof presetIndex === "number" ? presetIndex : 0;
    const p = colorPresets[i] || colorPresets[0];
    const root = document.documentElement;
    root.style.setProperty("--primary", p.primary);
    root.style.setProperty("--accent", p.accent);
    root.style.setProperty("--ring", p.primary);
    // Sidebar highlights follow primary; keep neutral accent for hover
    root.style.setProperty("--sidebar-primary", p.primary);
    root.style.setProperty("--sidebar-ring", p.primary);
    root.style.setProperty("--gradient-primary", `linear-gradient(135deg, hsl(${p.primary}) 0%, hsl(${p.primary}) 100%)`);
    root.style.setProperty("--gradient-accent", `linear-gradient(135deg, hsl(${p.accent}) 0%, hsl(${p.accent}) 100%)`);
    const hue = (p.primary.split(" ")[0] || "210").trim();
    root.style.setProperty("--gradient-sidebar", `linear-gradient(180deg, hsl(${hue} 35% 14% / 0.35) 0%, hsl(${hue} 35% 10% / 0.35) 100%)`);
  } catch (_e) { void 0 }
}

const App = () => {
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        const presetIndex = data?.settings?.appearance?.presetIndex;
        applyTheme(typeof presetIndex === "number" ? presetIndex : 0);
      } catch {
        applyTheme(0);
      }
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agendamentos" element={<Agendamentos />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/assinaturas" element={<Assinaturas />} />
            <Route path="/assistente" element={<Assistente />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
