
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { LogOut, UserCircle, Settings } from "lucide-react";
import Link from "next/link";

interface UserNavProps {
  user: { email?: string; name?: string } | null;
}

const getInitials = (name?: string): string => {
  if (!name || name.trim() === "") return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    const singleName = parts[0];
    if (singleName.length > 1) {
      return singleName.substring(0, 2).toUpperCase();
    }
    return singleName.substring(0, 1).toUpperCase();
  }
  return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
};

export function UserNav({ user }: UserNavProps) {
  const { logout } = useAuth();

  const userInitials = getInitials(user?.name);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png" alt={user?.name || "Usuario"} data-ai-hint="person portrait" />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none font-headline">{user?.name || "Usuario"}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard/perfil">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard/configuracion">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
