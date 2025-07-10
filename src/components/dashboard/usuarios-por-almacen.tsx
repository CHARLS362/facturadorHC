
'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Mock data, in a real scenario this would be fetched
const mockUsers = [
  { id: 'U-001', name: 'Ana García', email: 'ana.garcia@example.com', role: 'Gerente de Tienda' },
  { id: 'U-002', name: 'Carlos Mendoza', email: 'carlos.mendoza@example.com', role: 'Vendedor' },
  { id: 'U-003', name: 'Luisa Torres', email: 'luisa.torres@example.com', role: 'Vendedor' },
];

interface UsuariosPorAlmacenProps {
  almacenId: number;
}

export function UsuariosPorAlmacen({ almacenId }: UsuariosPorAlmacenProps) {
  // In a real app, you would use almacenId to fetch specific users.
  // useEffect(() => { fetchUsers(almacenId) }, [almacenId]);
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {user.name}
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant="outline">{user.role}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
