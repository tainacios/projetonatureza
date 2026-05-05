import { ReactNode } from "react";
import { NavLink, useLocation, useNavigate, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Star,
  ShoppingBag,
  Image as ImageIcon,
  MessageSquare,
  FileCheck,
  Bell,
  LogOut,
  Leaf,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";

import { Shield } from "lucide-react";

type ItemPerm = "loja" | "galeria" | "depoimentos" | "acoes" | "master" | null;
const items: { title: string; url: string; icon: any; end?: boolean; perm: ItemPerm }[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true, perm: null },
  { title: "Voluntários", url: "/admin/voluntarios", icon: Users, perm: null },
  { title: "EcoPontos", url: "/admin/ecopontos", icon: Star, perm: "acoes" },
  { title: "Loja", url: "/admin/loja", icon: ShoppingBag, perm: "loja" },
  { title: "Galeria", url: "/admin/galeria", icon: ImageIcon, perm: "galeria" },
  { title: "Depoimentos", url: "/admin/depoimentos", icon: MessageSquare, perm: "depoimentos" },
  { title: "Termos", url: "/admin/termos", icon: FileCheck, perm: null },
  { title: "Notificações", url: "/admin/notificacoes", icon: Bell, perm: null },
  { title: "Permissões", url: "/admin/permissoes", icon: Shield, perm: "master" },
];

const AdminSidebar = () => {
  const { pathname } = useLocation();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="h-9 w-9 rounded-full bg-gradient-leaf flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold text-primary">Admin</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Projeto Natureza
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = item.end
                  ? pathname === item.url
                  : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink
                        to={item.url}
                        end={item.end}
                        className={cn("flex items-center gap-2")}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/" className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                <span>Voltar ao site</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur px-4 sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Painel administrativo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden md:inline">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await signOut();
                  navigate("/");
                }}
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
