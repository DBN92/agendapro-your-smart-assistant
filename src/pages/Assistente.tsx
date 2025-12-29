import { useState } from "react";
import { Send, Bot, User, Sparkles, Settings, Mic, Paperclip } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Olá! 👋 Sou o assistente virtual da AgendaPro. Posso ajudar você a agendar horários, gerenciar clientes, ver relatórios e muito mais. Como posso ajudar hoje?",
    timestamp: new Date(),
  },
];

const suggestions = [
  "Quais são meus próximos agendamentos?",
  "Agendar horário para Maria Silva",
  "Mostrar clientes inativos",
  "Qual foi minha receita este mês?",
];

export default function Assistente() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAssistantResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAssistantResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes("agendamento") || lowerInput.includes("próximo")) {
      return "📅 Você tem 5 agendamentos para hoje:\n\n• 09:00 - Maria Silva (Corte)\n• 10:30 - João Santos (Barba)\n• 11:00 - Ana Costa (Coloração)\n• 14:00 - Pedro Lima (Corte + Barba)\n• 15:30 - Carla Oliveira (Hidratação)\n\nDeseja que eu entre em contato com algum deles?";
    }
    
    if (lowerInput.includes("receita") || lowerInput.includes("faturamento")) {
      return "💰 Aqui está seu resumo financeiro:\n\n• Receita de hoje: R$ 450,00\n• Receita da semana: R$ 2.180,00\n• Receita do mês: R$ 8.420,00\n\nVocê está 12% acima do mês anterior. Parabéns! 🎉";
    }
    
    if (lowerInput.includes("cliente") || lowerInput.includes("inativo")) {
      return "👥 Encontrei 2 clientes inativos (sem visita há mais de 30 dias):\n\n• Pedro Lima - Última visita há 45 dias\n• Fernanda Souza - Última visita há 60 dias\n\nDeseja que eu envie uma mensagem de reativação para eles?";
    }
    
    return "Entendi! Vou processar sua solicitação. Como posso ajudar mais? Posso agendar horários, mostrar relatórios, enviar lembretes aos clientes ou ajudar com configurações do sistema.";
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <DashboardLayout 
      title="Assistente IA" 
      subtitle="Seu assistente virtual inteligente"
    >
      <div className="flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto">
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Assistente AgendaPro</h3>
              <p className="text-sm text-success flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-slide-up",
                message.role === "user" && "flex-row-reverse"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Avatar className={cn(
                "h-8 w-8 shrink-0",
                message.role === "assistant" ? "bg-primary" : "bg-secondary"
              )}>
                <AvatarFallback className={cn(
                  message.role === "assistant" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground"
                )}>
                  {message.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              
              <div className={cn(
                "max-w-[75%] rounded-2xl px-4 py-3",
                message.role === "assistant" 
                  ? "bg-card border border-border rounded-tl-sm" 
                  : "gradient-primary text-primary-foreground rounded-tr-sm"
              )}>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className={cn(
                  "text-xs mt-1",
                  message.role === "assistant" ? "text-muted-foreground" : "text-primary-foreground/70"
                )}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <Avatar className="h-8 w-8 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div className="flex flex-wrap gap-2 py-4">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 rounded-full text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Digite sua mensagem..."
              className="flex-1"
            />
            <Button variant="ghost" size="icon" className="shrink-0">
              <Mic className="w-5 h-5" />
            </Button>
            <Button onClick={handleSend} disabled={!input.trim() || isTyping} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
