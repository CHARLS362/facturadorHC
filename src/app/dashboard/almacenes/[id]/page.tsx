
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Warehouse, ArrowLeft, Edit } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VentasPorAlmacen } from '@/components/dashboard/ventas-por-almacen';
import { StockPorAlmacen } from '@/components/dashboard/stock-por-almacen';
import { UsuariosPorAlmacen } from '@/components/dashboard/usuarios-por-almacen';

const ALMACENES_STORAGE_KEY = 'facturacionhc_mock_almacenes';

interface Almacen {
  IdAlmacen: number;
  Nombre: string;
  Direccion: string;
  Estado: boolean;
}

export default function DetalleAlmacenPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [almacen, setAlmacen] = useState<Almacen | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    try {
      const storedAlmacenes = localStorage.getItem(ALMACENES_STORAGE_KEY);
      if (!storedAlmacenes) {
          notFound();
          return;
      }
      const almacenes: Almacen[] = JSON.parse(storedAlmacenes);
      const foundAlmacen = almacenes.find(a => a.IdAlmacen === parseInt(id));

      if (!foundAlmacen) {
          notFound();
          return;
      }
      setAlmacen(foundAlmacen);
    } catch (error) {
      console.error("Failed to load warehouse data from storage", error);
      setAlmacen(null);
    } finally {
        setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
        <div className="space-y-8">
            <PageHeader title="Cargando Almacén..." icon={Warehouse} />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  if (!almacen) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Almacén no encontrado</h1>
        <p>No se pudo cargar la información del almacén. Por favor, intente de nuevo.</p>
        <Button onClick={() => router.push('/dashboard/almacenes')}>Volver al Listado</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={almacen.Nombre}
        description={almacen.Direccion}
        icon={Warehouse}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/almacenes">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Listado
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/almacenes/${id}/editar`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Almacén
              </Link>
            </Button>
          </div>
        }
      />
      
      <Tabs defaultValue="ventas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="stock">Stock de Productos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
        </TabsList>
        <TabsContent value="ventas">
          <Card>
            <CardHeader>
              <CardTitle>Ventas del Almacén</CardTitle>
              <CardDescription>
                Listado de las últimas ventas registradas en {almacen.Nombre}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VentasPorAlmacen almacenId={almacen.IdAlmacen} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle>Inventario de Productos</CardTitle>
              <CardDescription>
                Stock disponible de los productos en este almacén.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StockPorAlmacen almacenId={almacen.IdAlmacen} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Personal Asignado</CardTitle>
              <CardDescription>
                Usuarios que tienen acceso y gestionan este almacén.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsuariosPorAlmacen almacenId={almacen.IdAlmacen} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
