import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Calendar as CalIcon, MapPin } from "lucide-react";

interface Action {
  id: string;
  title: string;
  tag: string;
  scheduled_at: string;
  location: string | null;
  published: boolean;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const AdminCalendario = () => {
  const [items, setItems] = useState<Action[]>([]);
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("actions" as any)
        .select("id, title, tag, scheduled_at, location, published")
        .not("scheduled_at", "is", null)
        .order("scheduled_at", { ascending: true });
      setItems((data as any) ?? []);
    })();
  }, []);

  const eventDays = useMemo(
    () => items.map((a) => new Date(a.scheduled_at)),
    [items]
  );

  const dayItems = selected
    ? items.filter((a) => sameDay(new Date(a.scheduled_at), selected))
    : [];

  const upcoming = items.filter((a) => new Date(a.scheduled_at) >= new Date()).slice(0, 8);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Calendário</h1>
          <p className="text-muted-foreground">Visualize as ações agendadas</p>
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
              <h2 className="font-semibold text-primary mb-2">
                {selected ? selected.toLocaleDateString("pt-BR", { dateStyle: "full" }) : "Selecione um dia"}
              </h2>
              <div className="space-y-2">
                {dayItems.length === 0 && <p className="text-sm text-muted-foreground">Sem ações nesta data.</p>}
                {dayItems.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="p-3 space-y-1">
                      <div className="flex justify-between gap-2">
                        <div className="font-medium">{a.title}</div>
                        <span className="text-[10px] uppercase bg-muted px-2 py-0.5 rounded">{a.tag}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex gap-3">
                        <span className="flex items-center gap-1"><CalIcon className="h-3 w-3" />
                          {new Date(a.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {a.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.location}</span>}
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
                  <div key={a.id} className="flex justify-between text-sm p-2 rounded hover:bg-muted/40">
                    <span>{a.title}</span>
                    <span className="text-muted-foreground">
                      {new Date(a.scheduled_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCalendario;
