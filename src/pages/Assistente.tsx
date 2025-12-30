import { useState, useEffect } from "react";
type CSSVars = React.CSSProperties & { [key: string]: string | number | undefined };
import { Send, Bot, User, Sparkles, Settings, Mic, Paperclip, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  const [conversationId, setConversationId] = useState<string>(() => {
    const existing = typeof window !== "undefined" ? window.localStorage.getItem("ap_conversation_id") : null;
    if (existing && existing.length) return existing;
    const cid = `c-${Date.now()}`;
    if (typeof window !== "undefined") window.localStorage.setItem("ap_conversation_id", cid);
    return cid;
  });
  const [assistantTheme, setAssistantTheme] = useState<{ presetIndex: number; showHeader: boolean; bubbleRadius: string }>({ presetIndex: 0, showHeader: true, bubbleRadius: "xl" });
  const apiBase = import.meta.env.VITE_API_BASE || "/api";

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/assistant/settings`);
        const data = await res.json();
        const t = data?.settings?.assistantTheme;
        if (t) setAssistantTheme({
          presetIndex: typeof t.presetIndex === "number" ? t.presetIndex : 0,
          showHeader: typeof t.showHeader === "boolean" ? t.showHeader : true,
          bubbleRadius: typeof t.bubbleRadius === "string" ? t.bubbleRadius : "xl",
        });
      } catch (_e) { void 0 }
    })();
  }, [apiBase]);

  const handleNewConversation = () => {
    const cid = `c-${Date.now()}`;
    setConversationId(cid);
    if (typeof window !== "undefined") window.localStorage.setItem("ap_conversation_id", cid);
    setMessages([...initialMessages]);
    setInput("");
    setIsTyping(false);
  };

  const handleSend = async () => {
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
    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", timestamp: new Date() }]);
    const fallback = async () => {
      try {
        const res = await fetch(`${apiBase}/assistant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage.content, conversationId })
        });
        const data = await res.json();
        const content = typeof data?.content === "string" && data.content.length > 0 ? data.content : "Não consegui responder agora. Tente novamente em instantes.";
        if (typeof data?.conversationId === "string" && data.conversationId.length) {
          setConversationId(data.conversationId);
          if (typeof window !== "undefined") window.localStorage.setItem("ap_conversation_id", data.conversationId);
        }
        setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content } : m));
      } catch {
        setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: "Ocorreu um erro ao processar sua mensagem." } : m));
      } finally {
        setIsTyping(false);
      }
    };

    try {
      const es = new EventSource(`${apiBase}/assistant/stream?message=${encodeURIComponent(userMessage.content)}&conversationId=${encodeURIComponent(conversationId)}`);
      es.onmessage = (ev) => {
        const delta = ev.data ? JSON.parse(ev.data) : "";
        if (typeof delta === "string" && delta.length > 0) {
          setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: m.content + delta } : m));
        }
      };
      es.addEventListener("cid", (ev) => {
        try {
          const data = ev.data ? JSON.parse(ev.data) : {};
          if (typeof data?.conversationId === "string") {
            setConversationId(data.conversationId);
            if (typeof window !== "undefined") window.localStorage.setItem("ap_conversation_id", data.conversationId);
          }
        } catch (_e) { void 0 }
      });
      es.addEventListener("done", () => {
        setIsTyping(false);
        es.close();
      });
      es.onerror = () => {
        es.close();
        fallback();
      };
      es.addEventListener("error", () => {
        es.close();
        fallback();
      });
      setTimeout(() => {
        setIsTyping(false);
      }, 20000);
    } catch {
      await fallback();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <DashboardLayout 
      title="Assistente IA" 
      subtitle="Seu assistente virtual inteligente"
    >
      {(() => {
        const palette = ["192 75% 28%", "217 91% 50%", "152 60% 40%", "262 83% 58%", "330 81% 60%"];
        const primary = palette[assistantTheme.presetIndex] || palette[0];
        const styleVars: CSSVars = {
          "--primary": primary,
          "--accent": "38 92% 50%",
          "--ring": primary,
        };
        return (
          <div
            className="flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto"
            style={styleVars}
          >
            {/* Chat Header */}
            {assistantTheme.showHeader && (
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
              <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Nova conversa
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Iniciar nova conversa?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso vai limpar o histórico desta conversa e começar um novo atendimento.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleNewConversation}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
            )}
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
                    [
                      "max-w-[75%] px-4 py-3",
                      assistantTheme.bubbleRadius === "md" ? "rounded-md" :
                      assistantTheme.bubbleRadius === "lg" ? "rounded-lg" :
                      assistantTheme.bubbleRadius === "2xl" ? "rounded-2xl" : "rounded-xl",
                    ].join(" "),
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
        );
      })()}
      </DashboardLayout>
    );
  }
