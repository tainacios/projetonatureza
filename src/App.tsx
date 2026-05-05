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
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminVoluntarios from "./pages/admin/AdminVoluntarios.tsx";
import AdminEcoPontos from "./pages/admin/AdminEcoPontos.tsx";
import AdminLoja from "./pages/admin/AdminLoja.tsx";
import AdminGaleria from "./pages/admin/AdminGaleria.tsx";
import AdminDepoimentos from "./pages/admin/AdminDepoimentos.tsx";
import AdminTermos from "./pages/admin/AdminTermos.tsx";
import AdminNotificacoes from "./pages/admin/AdminNotificacoes.tsx";
import AdminPermissoes from "./pages/admin/AdminPermissoes.tsx";

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
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/voluntarios" element={<AdminVoluntarios />} />
            <Route path="/admin/ecopontos" element={<AdminEcoPontos />} />
            <Route path="/admin/loja" element={<AdminLoja />} />
            <Route path="/admin/galeria" element={<AdminGaleria />} />
            <Route path="/admin/depoimentos" element={<AdminDepoimentos />} />
            <Route path="/admin/termos" element={<AdminTermos />} />
            <Route path="/admin/notificacoes" element={<AdminNotificacoes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
