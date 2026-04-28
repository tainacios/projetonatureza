import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmitted?: () => void;
}

export const TestimonialDialog = ({ open, onOpenChange, onSubmitted }: Props) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [action, setAction] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!user) return;
    if (!name.trim() || !action.trim() || !content.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("testimonials").insert({
      user_id: user.id,
      volunteer_name: name.trim(),
      action_name: action.trim(),
      content: content.trim(),
      rating,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Depoimento enviado! 🌿",
      description: "Obrigado por compartilhar. Após aprovação, ele aparecerá aqui.",
    });
    setName("");
    setAction("");
    setContent("");
    setRating(5);
    onOpenChange(false);
    onSubmitted?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">Compartilhe sua experiência</DialogTitle>
          <DialogDescription>
            Conte como foi participar de uma ação do Projeto Natureza.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="t-name">Seu nome</Label>
            <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como deseja ser identificado" />
          </div>
          <div>
            <Label htmlFor="t-action">Ação que participou</Label>
            <Input id="t-action" value={action} onChange={(e) => setAction(e.target.value)} placeholder="Ex.: Plantio na Mata Atlântica" />
          </div>
          <div>
            <Label htmlFor="t-content">Seu depoimento</Label>
            <Textarea
              id="t-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Conte com o coração: o que sentiu, o que viveu, o que levou..."
              rows={5}
            />
          </div>
          <div>
            <Label>Avaliação</Label>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="transition-transform hover:scale-110"
                  aria-label={`${i + 1} estrelas`}
                >
                  <Star
                    className={`h-7 w-7 ${i < rating ? "text-accent fill-accent" : "text-muted-foreground/40"}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Button variant="hero" className="w-full" onClick={submit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar depoimento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
