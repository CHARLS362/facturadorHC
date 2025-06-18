"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  UsersRound, 
  ScanLine, 
  FileText,
  Settings,
  type LucideIcon
} from 'lucide-react';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';
import { cn } from '../../lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Panel Central', icon: LayoutDashboard },
  { href: '/dashboard/usuarios', label: 'Usuarios', icon: Users },
  { href: '/dashboard/productos', label: 'Productos', icon: Package },
  { href: '/dashboard/ventas', label: 'Ventas', icon: ShoppingCart },
  { href: '/dashboard/clientes', label: 'Clientes', icon: UsersRound },
  { href: '/dashboard/escaner', label: 'Escáner QR/Barra', icon: ScanLine },
  { href: '/dashboard/plantillas', label: 'Plantillas Factura', icon: FileText },
  // { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
            className={cn(
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
            )}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
