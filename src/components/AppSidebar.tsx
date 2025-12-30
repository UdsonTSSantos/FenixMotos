import { Bike, Users, FileText, LayoutDashboard, Building2 } from 'lucide-react'
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

const items = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Motos',
    url: '/motos',
    icon: Bike,
  },
  {
    title: 'Clientes',
    url: '/clientes',
    icon: Users,
  },
  {
    title: 'Financiamentos',
    url: '/financiamentos',
    icon: FileText,
  },
  {
    title: 'Empresa',
    url: '/empresa',
    icon: Building2,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { empresa } = useData()

  return (
    <Sidebar>
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
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <span className="font-medium">AD</span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">Admin User</span>
            <span className="text-xs">admin@motofin.com</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
