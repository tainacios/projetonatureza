import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Sobre from "./pages/Sobre.tsx";
import Acoes from "./pages/Acoes.tsx";
import Auth from "./pages/Auth.tsx";
import Loja from "./pages/Loja.tsx";
import Depoimentos from "./pages/Depoimentos.tsx";
import Transparencia from "./pages/Transparencia.tsx";
import Apadrinhe from "./pages/Apadrinhe.tsx";
import Galeria from "./pages/Galeria.tsx";
import TermoEcoPontos from "./pages/TermoEcoPontos.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/acoes" element={<Acoes />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/loja" element={<Loja />} />
            <Route path="/depoimentos" element={<Depoimentos />} />
            <Route path="/transparencia" element={<Transparencia />} />
            <Route path="/apadrinhe" element={<Apadrinhe />} />
            <Route path="/galeria" element={<Galeria />} />
            <Route path="/termo-ecopontos" element={<TermoEcoPontos />} />
            <Route path="/dashboard" element={<Loja />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
