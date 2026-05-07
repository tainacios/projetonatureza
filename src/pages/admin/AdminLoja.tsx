import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  image_url: string | null;
  stock: number;
  active: boolean;
}

const AdminLoja = () => {
  const [items, setItems] = useState<Reward[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Reward | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", points_cost: 100, stock: 10, active: true,
  });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("rewards").select("*").order("created_at", { ascending: false });
    setItems((data as Reward[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditing(null); setFile(null);
    setForm({ name: "", description: "", points_cost: 100, stock: 10, active: true });
    if (fileRef.current) fileRef.current.value = "";
  };
  const openNew = () => { reset(); setOpen(true); };
  const openEdit = (r: Reward) => {
    setEditing(r);
    setForm({
      name: r.name, description: r.description || "", points_cost: r.points_cost,
      stock: r.stock, active: r.active,
    });
    setFile(null); setOpen(true);
  };

  const submit = async () => {
    if (!form.name) return toast.error("Informe o nome");
    setSaving(true);
    try {
      let imageUrl = editing?.image_url || null;
      if (file) {
        const path = `rewards/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("gallery").upload(path, file);
        if (error) throw error;
        imageUrl = supabase.storage.from("gallery").getPublicUrl(path).data.publicUrl;
      }
      const payload = {
        name: form.name, description: form.description,
        points_cost: form.points_cost, stock: form.stock,
        active: form.active, image_url: imageUrl,
      };
      if (editing) {
        const { error } = await supabase.from("rewards").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rewards").insert(payload);
        if (error) throw error;
      }
      toast.success("Salvo"); setOpen(false); reset(); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (r: Reward) => {
    if (!confirm("Excluir este item da loja?")) return;
    const { error } = await supabase.from("rewards").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Excluído"); load();
  };

  const toggleActive = async (r: Reward) => {
    const { error } = await supabase.from("rewards").update({ active: !r.active }).eq("id", r.id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">Loja</h1>
            <p className="text-muted-foreground">Cadastre e edite os itens da loja</p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Novo item</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <Card key={r.id} className={`overflow-hidden ${!r.active ? "opacity-60" : ""}`}>
              {r.image_url && (
                <div className="aspect-video bg-muted">
                  <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between gap-2">
                  <div className="font-semibold">{r.name}</div>
                  <span className="text-accent font-bold">{r.points_cost} pts</span>
                </div>
                {r.description && <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>}
                <div className="text-xs text-muted-foreground">Estoque: {r.stock}</div>
                <div className="flex items-center gap-2 pt-2">
                  <Switch checked={r.active} onCheckedChange={() => toggleActive(r)} />
                  <span className="text-xs">{r.active ? "Ativo" : "Inativo"}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                    <Pencil className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">
              Nenhum item cadastrado.
            </p>
          )}
        </div>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar item" : "Novo item"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              <div>
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Custo (pts)</Label>
                  <Input type="number" value={form.points_cost}
                    onChange={(e) => setForm({ ...form, points_cost: parseInt(e.target.value || "0", 10) })} />
                </div>
                <div>
                  <Label>Estoque</Label>
                  <Input type="number" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value || "0", 10) })} />
                </div>
              </div>
              <div>
                <Label>Imagem {editing && "(opcional)"}</Label>
                <Input ref={fileRef} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label>Ativo na loja</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminLoja;
