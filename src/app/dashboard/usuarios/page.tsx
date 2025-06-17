import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, Users, FileDown } from "lucide-react";
import Image from "next/image";

const mockUsers = [
  { id: "USR001", name: "Ana García", email: "ana.garcia@example.com", role: "Admin", joinedDate: "2023-01-15", status: "Activo" },
  { id: "USR002", name: "Carlos López", email: "carlos.lopez@example.com", role: "Vendedor", joinedDate: "2023-02-20", status: "Activo" },
  { id: "USR003", name: "Laura Martínez", email: "laura.martinez@example.com", role: "Vendedor", joinedDate: "2023-03-10", status: "Inactivo" },
  { id: "USR004", name: "Pedro Rodríguez", email: "pedro.rodriguez@example.com", role: "Soporte", joinedDate: "2023-04-05", status: "Activo" },
];

export default function UsuariosPage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestión de Usuarios"
        description="Administra los usuarios del sistema, roles y permisos."
        icon={Users}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Usuario
            </Button>
          </div>
        }
      />

      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Busca y gestiona los usuarios existentes.</CardDescription>
          <div className="pt-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Buscar usuarios por nombre, email o rol..." className="pl-10 max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha de Ingreso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium flex items-center gap-2">
                     <Image src={`https://avatar.vercel.sh/${user.email}.png`} alt={user.name} width={32} height={32} className="rounded-full" />
                    {user.name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.joinedDate}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${user.status === "Activo" ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100" : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"}`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Editar</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
