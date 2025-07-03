
"use client";
import Link from 'next/link';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedDate: string;
  status: string;
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

export function UsuariosList({ initialData }: { initialData: MockUser[] }) {
  const [users, setUsers] = useState<MockUser[]>(initialData);
  const [userToDelete, setUserToDelete] = useState<MockUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(`/api/usuario/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Error al eliminar el usuario');
      }

      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));

      toast({
        variant: "success",
        title: (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 p-1 bg-emerald-500 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <span>Usuario eliminado</span>
          </div>
        ),
        description: `El usuario ${userToDelete.name} ha sido eliminado correctamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el usuario.",
      });
    } finally {
      setUserToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (user: MockUser) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Card className="shadow-lg rounded-lg w-full">
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Busca y gestiona los usuarios existentes.</CardDescription>
          <div className="pt-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar usuarios por nombre, email o rol..." 
              className="pl-10 max-w-sm" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
              {filteredUsers.map((user) => {
                  const userName = user.name;
                  const userInitials = getInitials(userName);
                  return (
                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src="https://placehold.co/40x40.png" alt={userName} data-ai-hint="person portrait" />
                          <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        {userName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell suppressHydrationWarning>{user.joinedDate}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${user.status === "Activo" ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100" : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"}`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="hover:text-primary transition-colors" asChild>
                            <Link href={`/dashboard/usuarios/${user.id}/editar`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 transition-colors" onClick={() => openDeleteDialog(user)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
           {filteredUsers.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              {searchTerm ? `No se encontraron usuarios con "${searchTerm}".` : "No hay usuarios registrados."}
            </p>
          )}
        </CardContent>
      </Card>

      {userToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Confirmar Eliminación
              </AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete.name}</strong>? 
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteUser}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Eliminar Usuario
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
