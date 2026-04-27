import { Leaf, Instagram, Facebook, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="bg-earth text-earth-foreground mt-20">
    <div className="container mx-auto px-4 py-16 grid gap-10 md:grid-cols-4">
      <div className="md:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
            <Leaf className="h-5 w-5 text-secondary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">Projeto Natureza</span>
        </div>
        <p className="font-display italic text-lg text-earth-foreground/80 max-w-md">
          "O propósito da vida é uma vida com propósito."
        </p>
        <p className="mt-4 text-sm text-earth-foreground/60 max-w-md">
          Uma rede de apoio que transforma vidas através do amor, da solidariedade e da fé —
          cuidando de pessoas, do meio ambiente e dos animais.
        </p>
      </div>

      <div>
        <h4 className="font-semibold mb-4">Navegação</h4>
        <ul className="space-y-2 text-sm text-earth-foreground/70">
          <li><Link to="/sobre" className="hover:text-secondary">Sobre nós</Link></li>
          <li><Link to="/acoes" className="hover:text-secondary">Nossas ações</Link></li>
          <li><Link to="/loja" className="hover:text-secondary">EcoPontos</Link></li>
          <li><Link to="/auth" className="hover:text-secondary">Seja voluntário</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold mb-4">Conecte-se</h4>
        <div className="flex gap-3">
          <a href="#" aria-label="Instagram" className="h-10 w-10 rounded-full bg-earth-foreground/10 hover:bg-accent flex items-center justify-center transition-colors">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="#" aria-label="Facebook" className="h-10 w-10 rounded-full bg-earth-foreground/10 hover:bg-accent flex items-center justify-center transition-colors">
            <Facebook className="h-4 w-4" />
          </a>
          <a href="mailto:contato@projetonatureza.org" aria-label="Email" className="h-10 w-10 rounded-full bg-earth-foreground/10 hover:bg-accent flex items-center justify-center transition-colors">
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>

    <div className="border-t border-earth-foreground/10 py-6 text-center text-xs text-earth-foreground/50">
      © {new Date().getFullYear()} Projeto Natureza · Feito com 💚 por quem acredita
    </div>
  </footer>
);
