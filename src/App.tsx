import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import NotFound from '@/pages/NotFound'
import { DataProvider } from '@/context/DataContext'
import { ThemeProvider } from '@/components/theme-provider'
import Motos from '@/pages/motos/Motos'
import MotoForm from '@/pages/motos/MotoForm'
import Clientes from '@/pages/clientes/Clientes'
import ClienteForm from '@/pages/clientes/ClienteForm'
import Financiamentos from '@/pages/financiamentos/Financiamentos'
import FinanciamentoForm from '@/pages/financiamentos/FinanciamentoForm'
import FinanciamentoDetails from '@/pages/financiamentos/FinanciamentoDetails'

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
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />

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
                path="/financiamentos/:id"
                element={<FinanciamentoDetails />}
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DataProvider>
      </TooltipProvider>
    </ThemeProvider>
  </BrowserRouter>
)

export default App
