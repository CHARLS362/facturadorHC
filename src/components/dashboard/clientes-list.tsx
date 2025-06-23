
"use client";
import Link from 'next/link';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Mail, Phone, Edit, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
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

export function ClientesList({ initialData }: { initialData: any[] }) {
  const [clients, setClients] = useState<any[]>(initialData);
  const [clientToDelete, setClientToDelete] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    return clients.filter(client =>
      (client.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.contact || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone || "").includes(searchTerm) ||
      (client.tipoCliente?.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      const res = await fetch(`/api/cliente/${clientToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setClients(prevClients => prevClients.filter(c => c.id !== clientToDelete.id));
        toast({
          variant: "success",
          title: (
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 p-1 bg-emerald-500 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <span>Cliente Eliminado</span>
            </div>
          ),
          description: `El cliente ${clientToDelete.name} ha sido eliminado.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "No se puede eliminar",
          description: data.error || "No se pudo eliminar el cliente.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al eliminar el cliente.",
      });
    }
    setClientToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (client: any) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Card className="shadow-lg rounded-lg w-full">
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
          <CardDescription>Busca y gestiona la información de tus clientes.</CardDescription>
          <div className="pt-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar clientes por nombre, RUC/DNI, email..." 
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
                <TableHead>Nombre / Razón Social</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => {
                  const clientName = client.name;
                  const clientInitials = getInitials(clientName);
                  return (
                    <TableRow key={client.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={`https://avatar.vercel.sh/${client.email}.png?size=40`} alt={clientName} />
                          <AvatarFallback>{clientInitials}</AvatarFallback>
                        </Avatar>
                        {clientName}
                      </TableCell>
                      <TableCell>{client.contact}</TableCell>
                      <TableCell>
                        <a href={`mailto:${client.email}`} className="text-primary hover:underline flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" /> {client.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a href={`tel:${client.phone}`} className="text-primary hover:underline flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" /> {client.phone}
                        </a>
                      </TableCell>
                      <TableCell>{client.tipoCliente?.descripcion}</TableCell>
                      <TableCell suppressHydrationWarning>{new Date(client.registeredAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="hover:text-primary transition-colors" asChild>
                          <Link href={`/dashboard/clientes/${client.id}/editar`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 transition-colors" onClick={() => openDeleteDialog(client)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
           {filteredClients.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              {searchTerm ? `No se encontraron clientes con "${searchTerm}".` : "No hay clientes registrados."}
            </p>
          )}
        </CardContent>
      </Card>

      {clientToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Confirmar Eliminación
              </AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas eliminar al cliente <strong>{clientToDelete.name}</strong>? 
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteClient}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Eliminar Cliente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
