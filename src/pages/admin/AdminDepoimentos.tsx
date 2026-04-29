import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Check, Trash2, Plus, Star } from "lucide-react";

interface Testimonial {
  id: string;
  volunteer_name: string;
  action_name: string;
  content: string;
  rating: number;
  approved: boolean;
  avatar_url: string | null;
  created_at: string;
}

const AdminDepoimentos = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [actionName, setActionName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [avatar, setAvatar] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as Testimonial[]) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (t: Testimonial) => {
    const { error } = await supabase
      .from("testimonials")
      .update({ approved: !t.approved })
      .eq("id", t.id);
    if (error) return toast.error(error.message);
    toast.success(t.approved ? "Removido da vitrine" : "Aprovado");
    load();
  };

  const remove = async (t: Testimonial) => {
    if (!confirm("Excluir depoimento?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", t.id);
    if (error) return toast.error(error.message);
    toast.success("Excluído");
    load();
  };

  const submit = async () => {
    if (!name || !content || !actionName) return toast.error("Preencha todos os campos");
    const { error } = await supabase.from("testimonials").insert({
      user_id: user!.id,
      volunteer_name: name,
      action_name: actionName,
      content,
      rating,
      avatar_url: avatar || null,
      approved: true,
    });
    if (error) return toast.error(error.message);
    toast.success("Depoimento adicionado");
    setOpen(false);
    setName("");
    setActionName("");
    setContent("");
    setAvatar("");
    setRating(5);
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">Depoimentos</h1>
            <p className="text-muted-foreground">Aprove, edite ou crie depoimentos</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo depoimento
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {items.map((t) => (
            <Card key={t.id} className={!t.approved ? "border-accent/40" : ""}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{t.volunteer_name}</div>
                    <div className="text-xs text-muted-foreground">{t.action_name}</div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{t.content}</p>
                <div className="flex items-center justify-between pt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      t.approved
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {t.approved ? "Aprovado" : "Pendente"}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => approve(t)}>
                      <Check className="h-3 w-3 mr-1" />
                      {t.approved ? "Despublicar" : "Aprovar"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(t)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">
              Nenhum depoimento.
            </p>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo depoimento</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Ação</Label>
                <Input value={actionName} onChange={(e) => setActionName(e.target.value)} />
              </div>
              <div>
                <Label>Texto</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
              </div>
              <div>
                <Label>Avaliação</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value) || 5)}
                />
              </div>
              <div>
                <Label>Foto (URL opcional)</Label>
                <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={submit}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminDepoimentos;
