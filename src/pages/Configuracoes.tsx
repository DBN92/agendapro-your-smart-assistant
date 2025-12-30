import { useState } from "react";
import { 
  Palette, 
  User, 
  Bell, 
  Bot, 
  Shield, 
  Building, 
  Clock,
  Save,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "empresa", label: "Empresa", icon: Building },
  { id: "aparencia", label: "Aparência", icon: Palette },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "assistente", label: "Assistente IA", icon: Bot },
  { id: "horarios", label: "Horários", icon: Clock },
  { id: "seguranca", label: "Segurança", icon: Shield },
];

const colorPresets = [
  { name: "Teal", primary: "192 75% 28%", accent: "38 92% 50%" },
  { name: "Azul", primary: "217 91% 50%", accent: "38 92% 50%" },
  { name: "Verde", primary: "152 60% 40%", accent: "38 92% 50%" },
  { name: "Roxo", primary: "262 83% 58%", accent: "38 92% 50%" },
  { name: "Rosa", primary: "330 81% 60%", accent: "38 92% 50%" },
];

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState("empresa");
  const [selectedColor, setSelectedColor] = useState(0);
  const [embedUrl, setEmbedUrl] = useState("");
  const apiBase = import.meta.env.VITE_API_BASE || "/api";
  const assistantOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const assistantEmbedSrc = assistantOrigin ? `${assistantOrigin}/assistente` : "";
  const embedCode = `<iframe src="${assistantEmbedSrc}" width="420" height="640" style="border:0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.12)"></iframe>`;
  const [copied, setCopied] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");
  const [assistantPresetIndex, setAssistantPresetIndex] = useState(0);
  const [assistantShowHeader, setAssistantShowHeader] = useState(true);
  const [assistantBubbleRadius, setAssistantBubbleRadius] = useState("xl");

  const loadAssistantSettings = async () => {
      try {
        const res = await fetch(`${apiBase}/assistant/settings`);
      const data = await res.json();
      const s = data?.settings || {};
      if (typeof s.embedUrl === "string") setEmbedUrl(s.embedUrl);
      if (typeof s.customInstructions === "string") setCustomInstructions(s.customInstructions);
      const t = s.assistantTheme || {};
      if (typeof t.presetIndex === "number") setAssistantPresetIndex(t.presetIndex);
      if (typeof t.showHeader === "boolean") setAssistantShowHeader(t.showHeader);
      if (typeof t.bubbleRadius === "string") setAssistantBubbleRadius(t.bubbleRadius);
    } catch (_e) { void 0 }
  };

  const saveAssistantSettings = async () => {
    try {
      await fetch(`${apiBase}/assistant/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          embedUrl, 
          customInstructions,
          assistantTheme: { presetIndex: assistantPresetIndex, showHeader: assistantShowHeader, bubbleRadius: assistantBubbleRadius }
        })
      });
      toast("Configurações do assistente salvas");
    } catch (_e) { void 0 }
  };

  const saveCompanySettings = async () => {
    try {
      const name = (document.getElementById("companyName") as HTMLInputElement)?.value || "";
      const phone = (document.getElementById("phone") as HTMLInputElement)?.value || "";
      const address = (document.getElementById("address") as HTMLInputElement)?.value || "";
      await fetch(`${apiBase}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: { name, phone, address } })
      });
      toast("Dados da empresa salvos");
    } catch (_e) { void 0 }
  };

  const getSwitchChecked = (id: string) => {
    const el = document.getElementById(id);
    return el?.getAttribute("data-state") === "checked";
  };

  const saveAppearanceSettings = async () => {
    try {
      const compactSidebar = getSwitchChecked("appearanceCompact") || false;
      const animations = getSwitchChecked("appearanceAnimations") || true;
      await fetch(`${apiBase}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appearance: { presetIndex: selectedColor, compactSidebar, animations } })
      });
      const p = colorPresets[selectedColor] || colorPresets[0];
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
      toast("Aparência salva");
    } catch (_e) { void 0 }
  };

  const saveNotificationsSettings = async () => {
    try {
      const whatsapp = getSwitchChecked("notifWhatsapp") || false;
      const email = getSwitchChecked("notifEmail") || false;
      const push = getSwitchChecked("notifPush") || false;
      const payment = getSwitchChecked("notifPayment") || false;
      await fetch(`${apiBase}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: { whatsapp, email, push, payment } })
      });
      toast("Notificações salvas");
    } catch (_e) { void 0 }
  };

  const saveHoursSettings = async () => {
    try {
      const days = Array.from({ length: 7 }).map((_, i) => {
        const open = getSwitchChecked(`hours-open-${i}`) || false;
        const start = (document.getElementById(`hours-start-${i}`) as HTMLInputElement)?.value || "09:00";
        const end = (document.getElementById(`hours-end-${i}`) as HTMLInputElement)?.value || "18:00";
        return { open, start, end };
      });
      await fetch(`${apiBase}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: days })
      });
      toast("Horários salvos");
    } catch (_e) { void 0 }
  };

  const saveSecuritySettings = async () => {
    try {
      const email = (document.getElementById("email") as HTMLInputElement)?.value || "";
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ security: { email } })
      });
      toast("Segurança salva");
    } catch (_e) { void 0 }
  };

  useState(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/settings`);
        const data = await res.json();
        const presetIndex = data?.settings?.appearance?.presetIndex;
        if (typeof presetIndex === "number") setSelectedColor(presetIndex);
      } catch (_e) { void 0 }
    })();
    return 0;
  });

  return (
    <DashboardLayout 
      title="Configurações" 
      subtitle="Personalize sua experiência"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 shrink-0">
          <nav className="bg-card rounded-xl border border-border p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Empresa */}
          {activeTab === "empresa" && (
            <div className="bg-card glass-strong rounded-xl border border-border p-6 space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Informações da Empresa</h3>
                
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center border-2 border-dashed border-border">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">Enviar Logo</Button>
                    <p className="text-xs text-muted-foreground mt-2">PNG, JPG até 2MB</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input id="companyName" defaultValue="Barbearia Premium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" defaultValue="(11) 99999-0000" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input id="address" defaultValue="Rua das Flores, 123 - Centro" />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-4">Tema e Layout do Assistente</h4>
                  <div className="space-y-4">
                    <div>
                      <Label>Paleta do Assistente</Label>
                      <div className="grid grid-cols-5 gap-3 mt-2">
                        {colorPresets.map((preset, index) => (
                          <button
                            key={`assistant-${preset.name}`}
                            onClick={() => setAssistantPresetIndex(index)}
                            className={cn(
                              "aspect-square rounded-xl p-3 transition-all",
                              assistantPresetIndex === index 
                                ? "ring-2 ring-primary ring-offset-2" 
                                : "hover:scale-105"
                            )}
                            style={{ backgroundColor: `hsl(${preset.primary})` }}
                          >
                            <span className="text-white text-xs font-medium">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mostrar cabeçalho do chat</Label>
                        <Switch id="assistantShowHeader" defaultChecked={assistantShowHeader} onClick={() => setAssistantShowHeader(!assistantShowHeader)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Arredondamento das bolhas</Label>
                        <select 
                          value={assistantBubbleRadius}
                          onChange={(e) => setAssistantBubbleRadius(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground"
                        >
                          <option value="md">Médio</option>
                          <option value="lg">Grande</option>
                          <option value="xl">Extra</option>
                          <option value="2xl">Máximo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={saveCompanySettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}

          {/* Aparência */}
          {activeTab === "aparencia" && (
            <div className="bg-card glass-strong rounded-xl border border-border p-6 space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Cores do Sistema</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Escolha uma paleta de cores para personalizar a interface
                </p>
                
                <div className="grid grid-cols-5 gap-3">
                  {colorPresets.map((preset, index) => (
                    <button
                      key={preset.name}
                      onClick={() => setSelectedColor(index)}
                      className={cn(
                        "aspect-square rounded-xl p-3 transition-all",
                        selectedColor === index 
                          ? "ring-2 ring-primary ring-offset-2" 
                          : "hover:scale-105"
                      )}
                      style={{ backgroundColor: `hsl(${preset.primary})` }}
                    >
                      <span className="text-white text-xs font-medium">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-4">Preferências de Exibição</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Sidebar Compacta</p>
                      <p className="text-sm text-muted-foreground">Mostrar apenas ícones na sidebar</p>
                    </div>
                    <Switch id="appearanceCompact" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Animações</p>
                      <p className="text-sm text-muted-foreground">Ativar animações na interface</p>
                    </div>
                    <Switch id="appearanceAnimations" defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={saveAppearanceSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}

          {/* Notificações */}
          {activeTab === "notificacoes" && (
            <div className="bg-card glass-strong rounded-xl border border-border p-6 space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Preferências de Notificação</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">Lembretes por WhatsApp</p>
                      <p className="text-sm text-muted-foreground">Enviar lembretes automáticos aos clientes</p>
                    </div>
                    <Switch id="notifWhatsapp" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">Lembretes por E-mail</p>
                      <p className="text-sm text-muted-foreground">Enviar confirmações por e-mail</p>
                    </div>
                    <Switch id="notifEmail" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">Notificações Push</p>
                      <p className="text-sm text-muted-foreground">Receber alertas no navegador</p>
                    </div>
                    <Switch id="notifPush" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">Alertas de Pagamento</p>
                      <p className="text-sm text-muted-foreground">Notificar sobre pagamentos e vencimentos</p>
                    </div>
                    <Switch id="notifPayment" defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={saveNotificationsSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}

          {/* Assistente IA */}
          {activeTab === "assistente" && (
            <div className="bg-card glass-strong rounded-xl border border-border p-6 space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Configurações do Assistente</h3>
                <div className="mb-4">
                  <Button size="sm" variant="secondary" onClick={loadAssistantSettings}>Carregar configurações</Button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="assistantName">Nome do Assistente</Label>
                    <Input id="assistantName" defaultValue="Assistente AgendaPro" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tom de Voz</Label>
                    <select 
                      id="tone"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground"
                    >
                      <option>Profissional</option>
                      <option>Amigável</option>
                      <option>Descontraído</option>
                      <option>Formal</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="embedUrl">Embed Site (URL)</Label>
                    <Input id="embedUrl" placeholder="https://" value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="customInstructions">Campo Personalizado (Diretrizes para o Assistente)</Label>
                    <textarea id="customInstructions" value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} className="w-full h-28 px-3 py-2 rounded-lg border border-border bg-background text-foreground resize-none" />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="greeting">Mensagem de Boas-vindas</Label>
                  <textarea 
                    id="greeting"
                    className="w-full h-24 px-3 py-2 rounded-lg border border-border bg-background text-foreground resize-none"
                    defaultValue="Olá! 👋 Sou o assistente virtual. Como posso ajudar você hoje?"
                  />
                </div>
                <div className="mt-6 space-y-2">
                  <Label htmlFor="embedCode">Código para incorporar no seu site</Label>
                  <textarea id="embedCode" value={embedCode} readOnly className="w-full h-28 px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm" />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => { await navigator.clipboard.writeText(embedCode); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                    >
                      {copied ? "Copiado" : "Copiar código"}
                    </Button>
                  </div>
                </div>
                {embedUrl && (
                  <div className="mt-4">
                    <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                      <div className="px-4 py-2 border-b border-border text-sm text-muted-foreground">Pré-visualização do Embed</div>
                      <div className="h-64">
                        <iframe src={embedUrl} className="w-full h-full" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-4">Funcionalidades</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Agendamento Automático</p>
                      <p className="text-sm text-muted-foreground">Permitir que o assistente agende horários</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Relatórios por Chat</p>
                      <p className="text-sm text-muted-foreground">Mostrar relatórios quando solicitado</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Envio de Lembretes</p>
                      <p className="text-sm text-muted-foreground">Enviar lembretes via assistente</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={saveAssistantSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}

          {/* Horários */}
          {activeTab === "horarios" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Horário de Funcionamento</h3>
                
                <div className="space-y-3">
                  {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((day, index) => (
                    <div key={day} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <div className="w-24">
                        <p className="font-medium text-foreground">{day}</p>
                      </div>
                      <Switch id={`hours-open-${index}`} defaultChecked={index < 6} />
                      {index < 6 && (
                        <div className="flex items-center gap-2 flex-1">
                          <Input id={`hours-start-${index}`} type="time" defaultValue="08:00" className="w-28" />
                          <span className="text-muted-foreground">às</span>
                          <Input id={`hours-end-${index}`} type="time" defaultValue="18:00" className="w-28" />
                        </div>
                      )}
                      {index >= 6 && (
                        <span className="text-sm text-muted-foreground">Fechado</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={saveHoursSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}

          {/* Segurança */}
          {activeTab === "seguranca" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Segurança da Conta</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" defaultValue="admin@empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-4">Autenticação</h4>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">Autenticação em Dois Fatores</p>
                    <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                  </div>
                  <Button variant="secondary" size="sm">Configurar</Button>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={saveSecuritySettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
