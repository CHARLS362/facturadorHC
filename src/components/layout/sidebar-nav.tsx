
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuItem as ProMenuItem } from 'react-pro-sidebar';
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
import { useProSidebar } from 'react-pro-sidebar';

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
  const { collapsed } = useProSidebar();

  return (
    <>
      {navItems.map((item) => (
        <ProMenuItem
          key={item.href}
          icon={<item.icon className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover/menu-button:rotate-[5deg] group-hover/menu-button:scale-110" />}
          component={<Link href={item.href} />}
          active={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
          // title attribute can be used for tooltips by react-pro-sidebar if configured
          // For custom tooltips on collapsed state, one might need more advanced setup
          // or rely on default browser title attribute if `title` prop is set on `ProMenuItem`
        >
          {!collapsed && item.label}
        </ProMenuItem>
      ))}
    </>
  );
}
