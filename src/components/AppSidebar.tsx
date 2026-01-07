import {
  Bike,
  Users,
  FileText,
  LayoutDashboard,
  Building2,
  Wrench,
  Package,
  FileSpreadsheet,
  BarChart3,
  UserCog,
  LogOut,
  Briefcase,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Link, useLocation } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { Button } from '@/components/ui/button'

export function AppSidebar() {
  const location = useLocation()
  const { empresa, currentUser, logout } = useData()

  // Updated menu items to reflect "Ordem de Serviço" instead of Orçamentos
  const items = [
    { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { title: 'Motos', url: '/motos', icon: Bike },
    { title: 'Clientes', url: '/clientes', icon: Users },
    { title: 'Financiamentos', url: '/financiamentos', icon: FileText },
    {
      title: 'Ordem de Serviço',
      url: '/ordens-servico',
      icon: FileSpreadsheet,
    },
    { title: 'Peças', url: '/pecas', icon: Package },
    { title: 'Serviços', url: '/servicos', icon: Wrench },
    { title: 'Empresa', url: '/empresa', icon: Building2 },
  ]

  const adminItems = [
    { title: 'Colaboradores', url: '/colaboradores', icon: UserCog },
    { title: 'Vendedores', url: '/vendedores', icon: Briefcase },
    { title: 'Comissões', url: '/relatorios/comissoes', icon: BarChart3 },
  ]

  const allowedAdminRoles = ['Administrador', 'Diretor', 'Gerente']
  const isAdmin = currentUser && allowedAdminRoles.includes(currentUser.role)

  return (
    <Sidebar className="print:hidden">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          {empresa.logo && (
            <img
              src={empresa.logo}
              alt="Logo"
              className="w-8 h-8 object-contain rounded-md"
            />
          )}
          {!empresa.logo && (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bike className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
          <span className="font-bold text-lg tracking-tight truncate">
            {empresa.nome || 'MotoFin'}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname === item.url ||
                      (item.url !== '/' &&
                        location.pathname.startsWith(item.url))
                    }
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith(item.url)}
                      tooltip={item.title}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center uppercase">
            {currentUser?.nome.substring(0, 2)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-medium text-foreground truncate">
              {currentUser?.nome}
            </span>
            <span className="text-xs truncate">{currentUser?.role}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
