'use client';
import Link from 'next/link';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Warehouse } from "lucide-react";
import { AlmacenesList } from '@/components/dashboard/almacenes-list';

// Mock data as requested. This will be used as the initial state if localStorage is empty.
const mockAlmacenes = [
  { IdAlmacen: 1, Nombre: 'Almacén Principal (Lima)', Direccion: 'Av. La Marina 123, San Miguel', Estado: true },
  { IdAlmacen: 2, Nombre: 'Sucursal Arequipa', Direccion: 'Calle Mercaderes 456, Arequipa', Estado: true },
  { IdAlmacen: 3, Nombre: 'Depósito Surco (Inactivo)', Direccion: 'Jr. Montebello 789, Surco', Estado: false },
];

export default function AlmacenesPage() {
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
      {/* The AlmacenesList component will now manage its own state, initialized with this mock data */}
      <AlmacenesList initialData={mockAlmacenes} />
    </div>
  );
}
