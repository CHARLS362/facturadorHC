"use client";
import Link from 'next/link';
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2, AlertTriangle, CheckCircle2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface Almacen {
  IdAlmacen: number;
  Nombre: string;
  Direccion: string;
  Estado: boolean;
}

const ALMACENES_STORAGE_KEY = 'facturacionhc_mock_almacenes';

export function AlmacenesList({ initialData }: { initialData: Almacen[] }) {
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [almacenToDelete, setAlmacenToDelete] = useState<Almacen | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // On component mount, try to load from localStorage
    try {
      const storedAlmacenes = localStorage.getItem(ALMACENES_STORAGE_KEY);
      if (storedAlmacenes) {
        setAlmacenes(JSON.parse(storedAlmacenes));
      } else {
        // If nothing in storage, use initialData and save it
        setAlmacenes(initialData);
        localStorage.setItem(ALMACENES_STORAGE_KEY, JSON.stringify(initialData));
      }
    } catch (error) {
        console.error("Failed to access localStorage:", error);
        setAlmacenes(initialData);
    }
  }, [initialData]);

  const filteredAlmacenes = useMemo(() => {
    if (!searchTerm) return almacenes;
    return almacenes.filter(almacen =>
      almacen.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      almacen.Direccion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [almacenes, searchTerm]);

  const handleDelete = () => {
    if (!almacenToDelete) return;
    
    // Simulate frontend deletion
    const updatedAlmacenes = almacenes.filter(a => a.IdAlmacen !== almacenToDelete.IdAlmacen);
    setAlmacenes(updatedAlmacenes);
    localStorage.setItem(ALMACENES_STORAGE_KEY, JSON.stringify(updatedAlmacenes));

    toast({
      variant: "success",
      title: <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-white" /><span>Almacén Eliminado</span></div>,
      description: `El almacén ${almacenToDelete.Nombre} ha sido eliminado.`,
    });

    setAlmacenToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (almacen: Almacen) => {
    setAlmacenToDelete(almacen);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Listado de Almacenes</CardTitle>
          <CardDescription>Busca y gestiona tus almacenes.</CardDescription>
          <div className="pt-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre o dirección..." 
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
                <TableHead>Dirección</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlmacenes.map((almacen) => (
                <TableRow key={almacen.IdAlmacen} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{almacen.Nombre}</TableCell>
                  <TableCell>{almacen.Direccion}</TableCell>
                  <TableCell>
                    <Badge variant={almacen.Estado ? 'default' : 'destructive'}>
                      {almacen.Estado ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="hover:text-primary transition-colors" asChild>
                      <Link href={`/dashboard/almacenes/${almacen.IdAlmacen}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver Detalles</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:text-primary transition-colors" asChild>
                      <Link href={`/dashboard/almacenes/${almacen.IdAlmacen}/editar`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 transition-colors" onClick={() => openDeleteDialog(almacen)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredAlmacenes.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No se encontraron almacenes.
            </p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Confirmar Eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el almacén <strong>{almacenToDelete?.Nombre}</strong>? 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
