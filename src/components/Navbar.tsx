import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const links = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "Sobre" },
  { to: "/acoes", label: "Ações" },
  { to: "/depoimentos", label: "Depoimentos" },
  { to: "/loja", label: "EcoPontos" },
];

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-full bg-gradient-leaf flex items-center justify-center shadow-soft group-hover:rotate-12 transition-transform p-1.5">
            <img src={logo} alt="Projeto Natureza" className="h-full w-full object-contain" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold text-primary">Projeto Natureza</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Vida com propósito</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                location.pathname === l.to
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:text-primary hover:bg-primary/5"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                Minha área
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
              Sou voluntário
            </Button>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/50 bg-background">
          <nav className="container mx-auto flex flex-col p-4 gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-2xl text-sm font-medium",
                  location.pathname === l.to ? "bg-primary/10 text-primary" : "text-foreground/70"
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2">
              {user ? (
                <Button variant="outline" className="w-full" onClick={() => { setOpen(false); navigate("/dashboard"); }}>
                  Minha área
                </Button>
              ) : (
                <Button variant="hero" className="w-full" onClick={() => { setOpen(false); navigate("/auth"); }}>
                  Sou voluntário
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
