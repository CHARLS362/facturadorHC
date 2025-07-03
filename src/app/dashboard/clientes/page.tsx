'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileDown, UsersRound } from "lucide-react";
import { ClientesList } from '@/components/dashboard/clientes-list';

export default function ClientesPage() {
  const [clientsData, setClientsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('/api/cliente');
        if (!res.ok) throw new Error('Error al obtener los clientes');
        const data = await res.json();
        setClientsData(data);
      } catch (error) {
        console.error('Error al cargar los clientes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestión de Clientes"
        description="Administra la información de tus clientes y su historial."
        icon={UsersRound}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/clientes/exportar">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar Clientes
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/clientes/nuevo">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Cliente
              </Link>
            </Button>
          </div>
        }
      />

      {loading ? (
        <p className="text-gray-500">Cargando clientes... Espere un momento por favor</p>
      ) : (
        <ClientesList initialData={clientsData} />
      )}
    </div>
  );
}

