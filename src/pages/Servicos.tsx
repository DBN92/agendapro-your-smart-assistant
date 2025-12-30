import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Pencil, Plus } from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  durationMin: number;
  description?: string;
  category?: string;
}

export default function Servicos() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [durationMin, setDurationMin] = useState<number>(30);
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const categories = ["Cabelo", "Barba", "Tratamento", "Outros"];
  const [category, setCategory] = useState<string>(categories[0]);

  const load = async () => {
    const res = await fetch("/api/services");
    const data = await res.json();
    setItems(Array.isArray(data?.services) ? data.services : []);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setName("");
    setPrice(0);
    setDurationMin(30);
    setDescription("");
    setCategory(categories[0]);
    setEditingId(null);
  };

  const submit = async () => {
    if (!name.trim()) return;
    if (editingId) {
      await fetch(`/api/services/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, durationMin, description, category })
      });
    } else {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, durationMin, description, category })
      });
    }
    await load();
    resetForm();
  };

  const edit = (s: ServiceItem) => {
    setEditingId(s.id);
    setName(s.name);
    setPrice(s.price);
    setDurationMin(s.durationMin);
    setDescription(s.description || "");
    setCategory(s.category || categories[0]);
  };

  const remove = async (id: string) => {
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    await load();
    if (editingId === id) resetForm();
  };

  return (
    <DashboardLayout title="Serviços" subtitle="Cadastre os serviços disponíveis">
      <div className="space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Novo serviço</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Corte de Cabelo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$)</Label>
            <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground">
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duração (min)</Label>
            <Input id="duration" type="number" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="desc">Descrição</Label>
            <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes do serviço" />
          </div>
        </div>
          <div className="flex gap-2">
            <Button onClick={submit}>
              {editingId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {editingId ? "Salvar alterações" : "Adicionar serviço"}
            </Button>
            {editingId && (
              <Button variant="secondary" onClick={resetForm}>Cancelar</Button>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total de serviços: {items.length}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Preço</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Categoria</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Duração</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground hidden md:table-cell">Descrição</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((s, idx) => (
                  <tr key={s.id} className="animate-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
                    <td className="px-4 py-3 text-foreground">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">R$ {s.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.durationMin} min</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.description}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => edit(s)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(s.id)}>
                          <Trash2 className="w-4 h-4" />
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