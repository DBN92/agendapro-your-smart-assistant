import { CreditCard, CheckCircle, AlertCircle, Clock, Download, ArrowUpRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const currentPlan = {
  name: "Profissional",
  price: "R$ 99,90",
  period: "/mês",
  status: "active",
  nextBilling: "15 de Janeiro, 2025",
  features: [
    "Agendamentos ilimitados",
    "Até 5 profissionais",
    "Lembretes por WhatsApp",
    "Relatórios avançados",
    "Assistente IA incluído",
    "Suporte prioritário",
  ],
};

const invoices = [
  { id: "INV-001", date: "15/12/2024", amount: "R$ 99,90", status: "paid" },
  { id: "INV-002", date: "15/11/2024", amount: "R$ 99,90", status: "paid" },
  { id: "INV-003", date: "15/10/2024", amount: "R$ 99,90", status: "paid" },
  { id: "INV-004", date: "15/09/2024", amount: "R$ 99,90", status: "paid" },
];

const plans = [
  {
    name: "Básico",
    price: "R$ 49,90",
    period: "/mês",
    features: ["100 agendamentos/mês", "1 profissional", "Lembretes por e-mail"],
    current: false,
  },
  {
    name: "Profissional",
    price: "R$ 99,90",
    period: "/mês",
    features: ["Agendamentos ilimitados", "Até 5 profissionais", "Lembretes WhatsApp", "Assistente IA"],
    current: true,
    recommended: true,
  },
  {
    name: "Empresarial",
    price: "R$ 199,90",
    period: "/mês",
    features: ["Tudo do Profissional", "Profissionais ilimitados", "API personalizada", "Gerente dedicado"],
    current: false,
  },
];

export default function Assinaturas() {
  return (
    <DashboardLayout 
      title="Assinaturas" 
      subtitle="Gerencie seu plano e pagamentos"
    >
      <div className="space-y-6">
        {/* Current Plan */}
        <div className="bg-card rounded-xl border border-border overflow-hidden animate-slide-up">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success">
                    Ativo
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Próxima cobrança: {currentPlan.nextBilling}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  Plano {currentPlan.name}
                </h3>
                <p className="text-3xl font-bold text-primary">
                  {currentPlan.price}
                  <span className="text-lg font-normal text-muted-foreground">{currentPlan.period}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">Alterar Plano</Button>
                <Button variant="outline">Cancelar</Button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h4 className="font-semibold text-foreground mb-4">Recursos incluídos:</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentPlan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card rounded-xl border border-border p-6 animate-slide-up" style={{ animationDelay: "50ms" }}>
          <h3 className="font-semibold text-foreground mb-4">Método de Pagamento</h3>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expira em 12/2026</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">Atualizar</Button>
          </div>
        </div>

        {/* Plans Comparison */}
        <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h3 className="font-semibold text-foreground mb-4">Comparar Planos</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "rounded-xl border p-5 transition-all",
                  plan.current 
                    ? "border-primary bg-primary/5 shadow-glow" 
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {plan.recommended && (
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground mb-3">
                    Recomendado
                  </span>
                )}
                <h4 className="text-lg font-bold text-foreground">{plan.name}</h4>
                <p className="text-2xl font-bold text-primary mt-2">
                  {plan.price}
                  <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                </p>
                
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-success shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full mt-5" 
                  variant={plan.current ? "secondary" : "default"}
                  disabled={plan.current}
                >
                  {plan.current ? "Plano Atual" : "Selecionar"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice History */}
        <div className="bg-card rounded-xl border border-border overflow-hidden animate-slide-up" style={{ animationDelay: "150ms" }}>
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-foreground">Histórico de Faturas</h3>
          </div>
          <div className="divide-y divide-border">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-foreground">{invoice.amount}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                    Pago
                  </span>
                  <Button variant="ghost" size="icon-sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
