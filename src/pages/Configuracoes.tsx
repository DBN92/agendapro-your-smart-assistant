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
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-fade-in">
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
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}

          {/* Aparência */}
          {activeTab === "aparencia" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-fade-in">
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
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Animações</p>
                      <p className="text-sm text-muted-foreground">Ativar animações na interface</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}

          {/* Notificações */}
          {activeTab === "notificacoes" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Preferências de Notificação</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">Lembretes por WhatsApp</p>
                      <p className="text-sm text-muted-foreground">Enviar lembretes automáticos aos clientes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">Lembretes por E-mail</p>
                      <p className="text-sm text-muted-foreground">Enviar confirmações por e-mail</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">Notificações Push</p>
                      <p className="text-sm text-muted-foreground">Receber alertas no navegador</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">Alertas de Pagamento</p>
                      <p className="text-sm text-muted-foreground">Notificar sobre pagamentos e vencimentos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}

          {/* Assistente IA */}
          {activeTab === "assistente" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Configurações do Assistente</h3>
                
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
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="greeting">Mensagem de Boas-vindas</Label>
                  <textarea 
                    id="greeting"
                    className="w-full h-24 px-3 py-2 rounded-lg border border-border bg-background text-foreground resize-none"
                    defaultValue="Olá! 👋 Sou o assistente virtual. Como posso ajudar você hoje?"
                  />
                </div>
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
                <Button>
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
                      <Switch defaultChecked={index < 6} />
                      {index < 6 && (
                        <div className="flex items-center gap-2 flex-1">
                          <Input type="time" defaultValue="08:00" className="w-28" />
                          <span className="text-muted-foreground">às</span>
                          <Input type="time" defaultValue="18:00" className="w-28" />
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
                <Button>
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
                <Button>
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
