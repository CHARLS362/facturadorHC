
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Warehouse } from "lucide-react";
import { AlmacenesList } from '@/components/dashboard/almacenes-list';
import { Skeleton } from '@/components/ui/skeleton';

export default function AlmacenesPage() {
  const [almacenes, setAlmacenes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlmacenes = async () => {
      try {
        const response = await fetch('/api/almacen');
        if (!response.ok) {
          throw new Error('Error al obtener los datos de los almacenes.');
        }
        const data = await response.json();
        setAlmacenes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlmacenes();
  }, []);

  const LoadingSkeleton = () => (
     <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
    </div>
  );

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestión de Almacenes"
        description="Administra tus sucursales, depósitos y puntos de venta."
        icon={Warehouse}
        actions={
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/almacenes/nuevo">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Almacén
              </Link>
            </Button>
          </div>
        }
      />
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <AlmacenesList initialData={almacenes} />
      )}
    </div>
  );
}
