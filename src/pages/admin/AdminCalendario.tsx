import { useEffect, useMemo, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
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
import { Calendar as CalIcon, MapPin, Plus, Pencil, Trash2 } from "lucide-react";

interface Action {
  id: string;
  title: string;
  tag: string;
  description: string;
  story: string | null;
  image_url: string | null;
  scheduled_at: string;
  location: string | null;
  published: boolean;
}

const TAGS = ["Infância", "Terceira idade", "Famílias", "Meio ambiente", "Eventos"];

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const toLocalDatetime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AdminCalendario = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Action[]>([]);
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Action | null>(null);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "", tag: "Eventos", story: "", description: "",
    location: "", scheduled_at: "", published: true,
  });

  const load = async () => {
    const { data } = await supabase
      .from("actions" as any)
      .select("*")
      .not("scheduled_at", "is", null)
      .order("scheduled_at", { ascending: true });
    setItems((data as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditing(null); setFile(null);
    setForm({ title: "", tag: "Eventos", story: "", description: "", location: "", scheduled_at: "", published: true });
    if (fileRef.current) fileRef.current.value = "";
  };

  const openNew = (date?: Date) => {
    reset();
    const base = date ?? selected ?? new Date();
    const d = new Date(base);
    d.setHours(9, 0, 0, 0);
    setForm((f) => ({ ...f, scheduled_at: toLocalDatetime(d) }));
    setOpen(true);
  };

  const openEdit = (a: Action) => {
    setEditing(a); setFile(null);
    setForm({
      title: a.title, tag: a.tag, story: a.story || "", description: a.description,
      location: a.location || "",
      scheduled_at: toLocalDatetime(new Date(a.scheduled_at)),
      published: a.published,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.title) return toast.error("Informe um título");
    if (!form.scheduled_at) return toast.error("Informe data e hora");
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
        scheduled_at: new Date(form.scheduled_at).toISOString(),
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
    if (!confirm("Excluir este evento?")) return;
    const { error } = await supabase.from("actions" as any).delete().eq("id", a.id);
    if (error) return toast.error(error.message);
    toast.success("Excluído"); load();
  };

  const eventDays = useMemo(() => items.map((a) => new Date(a.scheduled_at)), [items]);
  const dayItems = selected ? items.filter((a) => sameDay(new Date(a.scheduled_at), selected)) : [];
  const upcoming = items.filter((a) => new Date(a.scheduled_at) >= new Date()).slice(0, 8);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">Calendário</h1>
            <p className="text-muted-foreground">Agende e edite as ações do mês</p>
          </div>
          <Button onClick={() => openNew()}>
            <Plus className="h-4 w-4 mr-2" /> Novo evento
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-4 flex justify-center">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={setSelected}
                modifiers={{ event: eventDays }}
                modifiersClassNames={{ event: "bg-accent/30 text-accent-foreground font-bold rounded-full" }}
                className="p-3 pointer-events-auto"
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-primary">
                  {selected ? selected.toLocaleDateString("pt-BR", { dateStyle: "full" }) : "Selecione um dia"}
                </h2>
                {selected && (
                  <Button size="sm" variant="outline" onClick={() => openNew(selected)}>
                    <Plus className="h-3 w-3 mr-1" /> Agendar
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {dayItems.length === 0 && <p className="text-sm text-muted-foreground">Sem ações nesta data.</p>}
                {dayItems.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="p-3 space-y-1">
                      <div className="flex justify-between gap-2">
                        <div className="font-medium">{a.title}</div>
                        <span className="text-[10px] uppercase bg-muted px-2 py-0.5 rounded">{a.tag}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex gap-3 flex-wrap">
                        <span className="flex items-center gap-1"><CalIcon className="h-3 w-3" />
                          {new Date(a.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {a.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.location}</span>}
                      </div>
                      <div className="flex gap-2 pt-1">
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
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-primary mb-2">Próximas ações</h2>
              <div className="space-y-2">
                {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma ação futura.</p>}
                {upcoming.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => openEdit(a)}
                    className="w-full text-left flex justify-between text-sm p-2 rounded hover:bg-muted/40"
                  >
                    <span>{a.title}</span>
                    <span className="text-muted-foreground">
                      {new Date(a.scheduled_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar evento" : "Novo evento"}</DialogTitle>
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
                  <Label>Data e hora</Label>
                  <Input type="datetime-local" value={form.scheduled_at}
                    onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Local</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label>História (opcional)</Label>
                <Textarea value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} />
              </div>
              <div>
                <Label>Imagem {editing && "(opcional)"}</Label>
                <Input ref={fileRef} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                <Label>Publicado no site</Label>
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

export default AdminCalendario;
