import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import NotFound from '@/pages/NotFound'
import { DataProvider, useData } from '@/context/DataContext'
import { ThemeProvider } from '@/components/theme-provider'
import Login from '@/pages/Login'

// Modules
import Motos from '@/pages/motos/Motos'
import MotoForm from '@/pages/motos/MotoForm'
import Clientes from '@/pages/clientes/Clientes'
import ClienteForm from '@/pages/clientes/ClienteForm'
import Financiamentos from '@/pages/financiamentos/Financiamentos'
import FinanciamentoForm from '@/pages/financiamentos/FinanciamentoForm'
import FinanciamentoDetails from '@/pages/financiamentos/FinanciamentoDetails'
import FinanciamentoExtrato from '@/pages/financiamentos/FinanciamentoExtrato'
import Empresa from '@/pages/empresa/Empresa'
import Usuarios from '@/pages/usuarios/Usuarios'
import UsuarioForm from '@/pages/usuarios/UsuarioForm'
import Pecas from '@/pages/pecas/Pecas'
import Servicos from '@/pages/servicos/Servicos'
import Orcamentos from '@/pages/orcamentos/Orcamentos'
import OrcamentoForm from '@/pages/orcamentos/OrcamentoForm'
import Comissoes from '@/pages/relatorios/Comissoes'

function RequireAuth({ children }: { children: JSX.Element }) {
  const { currentUser } = useData()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route path="/" element={<Index />} />

              <Route path="/empresa" element={<Empresa />} />

              <Route path="/motos" element={<Motos />} />
              <Route path="/motos/nova" element={<MotoForm />} />
              <Route path="/motos/:id" element={<MotoForm />} />

              <Route path="/clientes" element={<Clientes />} />
              <Route path="/clientes/novo" element={<ClienteForm />} />
              <Route path="/clientes/:id" element={<ClienteForm />} />

              <Route path="/financiamentos" element={<Financiamentos />} />
              <Route
                path="/financiamentos/novo"
                element={<FinanciamentoForm />}
              />
              <Route
                path="/financiamentos/:id/editar"
                element={<FinanciamentoForm />}
              />
              <Route
                path="/financiamentos/:id"
                element={<FinanciamentoDetails />}
              />
              <Route
                path="/financiamentos/:id/extrato"
                element={<FinanciamentoExtrato />}
              />

              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/usuarios/novo" element={<UsuarioForm />} />
              <Route path="/usuarios/:id" element={<UsuarioForm />} />

              <Route path="/pecas" element={<Pecas />} />
              <Route path="/servicos" element={<Servicos />} />

              <Route path="/orcamentos" element={<Orcamentos />} />
              <Route path="/orcamentos/novo" element={<OrcamentoForm />} />
              <Route path="/orcamentos/:id" element={<OrcamentoForm />} />

              <Route path="/relatorios/comissoes" element={<Comissoes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DataProvider>
      </TooltipProvider>
    </ThemeProvider>
  </BrowserRouter>
)

export default App
