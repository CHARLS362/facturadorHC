
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Warehouse } from "lucide-react";
import { EditarAlmacenForm } from '@/components/dashboard/editar-almacen-form';
import { Skeleton } from '@/components/ui/skeleton';

export interface AlmacenFormData {
  Nombre: string;
  Direccion: string;
  Estado: boolean;
}

export default function EditarAlmacenPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [initialData, setInitialData] = useState<AlmacenFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchAlmacenData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/almacen/${id}`);

        if (res.status === 404) {
          notFound();
          return;
        }
        if (!res.ok) {
          throw new Error('Error al cargar datos del almacén');
        }
        const data = await res.json();
        setInitialData(data);
      } catch (error) {
        console.error(error);
        setInitialData(null); // Set to null on error
      } finally {
        setIsLoading(false);
      }
    }
    fetchAlmacenData();
  }, [id]);

  if (isLoading) {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Cargando Almacén..."
                icon={Warehouse}
            />
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-32 ml-auto" />
            </div>
        </div>
    );
  }

  if (!initialData) {
    // This could be a more user-friendly error component
    return <div>No se pudo cargar la información del almacén.</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Editar Almacén: ${initialData.Nombre}`}
        description="Modifique la información del almacén."
        icon={Warehouse}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/almacenes">Volver al Listado</Link>
          </Button>
        }
      />
      <EditarAlmacenForm 
        almacenId={id} 
        initialData={initialData} 
      />
    </div>
  );
}
