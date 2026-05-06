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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Calendar as CalIcon } from "lucide-react";

interface Action {
  id: string;
  title: string;
  tag: string;
  story: string | null;
  description: string;
  image_url: string | null;
  location: string | null;
  scheduled_at: string | null;
  published: boolean;
}

const TAGS = ["Infância", "Terceira idade", "Famílias", "Meio ambiente", "Eventos"];

const AdminAcoes = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Action[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Action | null>(null);
  const [form, setForm] = useState({
    title: "", tag: "Eventos", story: "", description: "",
    location: "", scheduled_at: "", published: true,
  });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("actions" as any)
      .select("*")
      .order("scheduled_at", { ascending: true, nullsFirst: false });
    setItems((data as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditing(null); setFile(null);
    setForm({ title: "", tag: "Eventos", story: "", description: "", location: "", scheduled_at: "", published: true });
    if (fileRef.current) fileRef.current.value = "";
  };
  const openNew = () => { reset(); setOpen(true); };
  const openEdit = (a: Action) => {
    setEditing(a);
    setForm({
      title: a.title, tag: a.tag, story: a.story || "", description: a.description,
      location: a.location || "",
      scheduled_at: a.scheduled_at ? new Date(a.scheduled_at).toISOString().slice(0, 16) : "",
      published: a.published,
    });
    setFile(null); setOpen(true);
  };

  const submit = async () => {
    if (!form.title) return toast.error("Informe um título");
    setSaving(true);
    try {
      let imageUrl = editing?.image_url || null;
      if (file) {
        const path = `actions/${user?.id}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("gallery").upload(path, file);
        if (error) throw error;
        imageUrl = supabase.storage.from("gallery").getPublicUrl(path).data.publicUrl;
      }
      const payload = {
        title: form.title, tag: form.tag, story: form.story || null,
        description: form.description, location: form.location || null,
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
        published: form.published, image_url: imageUrl,
      };
      if (editing) {
        const { error } = await supabase.from("actions" as any).update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("actions" as any).insert({ ...payload, created_by: user?.id });
        if (error) throw error;
      }
      toast.success("Salvo"); setOpen(false); reset(); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (a: Action) => {
    if (!confirm("Excluir esta ação?")) return;
    const { error } = await supabase.from("actions" as any).delete().eq("id", a.id);
    if (error) return toast.error(error.message);
    toast.success("Excluída"); load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">Ações</h1>
            <p className="text-muted-foreground">Crie e agende as ações do projeto</p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Nova ação</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <Card key={a.id} className="overflow-hidden">
              {a.image_url && (
                <div className="aspect-video bg-muted">
                  <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="font-semibold">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.tag}</div>
                  </div>
                  {!a.published && <span className="text-[10px] uppercase bg-muted px-2 py-0.5 rounded">rascunho</span>}
                </div>
                {a.scheduled_at && (
                  <div className="text-xs flex items-center gap-1 text-accent">
                    <CalIcon className="h-3 w-3" />
                    {new Date(a.scheduled_at).toLocaleString("pt-BR")}
                  </div>
                )}
                {a.description && <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                    <Pencil className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(a)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">
              Nenhuma ação cadastrada.
            </p>
          )}
        </div>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar ação" : "Nova ação"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              <div>
                <Label>Título</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Categoria</Label>
                  <select
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  >
                    {TAGS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Data agendada</Label>
                  <Input type="datetime-local" value={form.scheduled_at}
                    onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Local</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <Label>História (citação)</Label>
                <Textarea value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label>Imagem {editing && "(opcional)"}</Label>
                <Input ref={fileRef} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                <Label>Publicada no site</Label>
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

export default AdminAcoes;
