
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
  KeyRound,
  type LucideIcon
} from 'lucide-react';
import { useProSidebar } from 'react-pro-sidebar';
import { useAuth } from '@/contexts/auth-context';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Panel Central', icon: LayoutDashboard },
  { href: '/dashboard/usuarios', label: 'Usuarios', icon: Users },
  { href: '/dashboard/productos', label: 'Productos', icon: Package },
  { href: '/dashboard/ventas', label: 'Ventas', icon: ShoppingCart },
  { href: '/dashboard/clientes', label: 'Clientes', icon: UsersRound },
  { href: '/dashboard/escaner', label: 'Escáner QR/Barra', icon: ScanLine },
  { href: '/dashboard/plantillas', label: 'Plantillas Factura', icon: FileText },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
  { href: '/dashboard/sunat-credentials', label: 'Credenciales SUNAT', icon: KeyRound, adminOnly: true },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { collapsed } = useProSidebar();
  const { user } = useAuth();

  return (
    <>
      {navItems.map((item) => {
        // If item is adminOnly and user is not Admin, don't render it
        if (item.adminOnly && user?.role !== 'Admin') {
          return null;
        }

        return (
          <ProMenuItem
            key={item.href}
            icon={<item.icon className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover:rotate-[5deg] group-hover:scale-110" />}
            component={<Link href={item.href} className="group" />}
            active={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
          >
            {!collapsed && item.label}
          </ProMenuItem>
        );
      })}
    </>
  );
}
