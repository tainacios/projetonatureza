import { useEffect, useRef, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Trash2, Pencil, Upload } from "lucide-react";

interface Photo {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  published: boolean;
}

const CATEGORIES = ["criancas", "idosos", "animais", "eventos"];
const CATEGORY_LABEL: Record<string, string> = {
  criancas: "Crianças",
  idosos: "Idosos",
  animais: "Animais",
  eventos: "Eventos",
};

const AdminGaleria = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Photo | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("eventos");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("created_at", { ascending: false });
    setPhotos((data as Photo[]) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setEditing(null);
    setTitle("");
    setDesc("");
    setCategory("eventos");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const openNew = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (p: Photo) => {
    setEditing(p);
    setTitle(p.title);
    setDesc(p.description || "");
    setCategory(p.category);
    setFile(null);
    setOpen(true);
  };

  const submit = async () => {
    if (!title) return toast.error("Informe um título");
    setUploading(true);
    try {
      let imageUrl = editing?.image_url || "";
      if (file) {
        const path = `${user?.id}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("gallery").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("gallery").getPublicUrl(path);
        imageUrl = data.publicUrl;
      }
      if (!imageUrl) {
        toast.error("Selecione uma imagem");
        setUploading(false);
        return;
      }
      if (editing) {
        const { error } = await supabase
          .from("gallery_photos")
          .update({ title, description: desc, category, image_url: imageUrl })
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gallery_photos").insert({
          title,
          description: desc,
          category,
          image_url: imageUrl,
          created_by: user?.id,
        });
        if (error) throw error;
      }
      toast.success("Salvo");
      setOpen(false);
      reset();
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const remove = async (p: Photo) => {
    if (!confirm("Excluir esta foto?")) return;
    const { error } = await supabase.from("gallery_photos").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Foto excluída");
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">Galeria</h1>
            <p className="text-muted-foreground">Faça upload e organize fotos</p>
          </div>
          <Button onClick={openNew}>
            <Upload className="h-4 w-4 mr-2" /> Nova foto
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="aspect-video bg-muted">
                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {CATEGORY_LABEL[p.category] || p.category}
                    </div>
                  </div>
                </div>
                {p.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                    <Pencil className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(p)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {photos.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">
              Nenhuma foto cadastrada.
            </p>
          )}
        </div>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar foto" : "Nova foto"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABEL[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Imagem {editing && "(deixe em branco para manter atual)"}</Label>
                <Input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={submit} disabled={uploading}>
                {uploading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminGaleria;
