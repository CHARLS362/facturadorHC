
import Link from 'next/link';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileDown, UsersRound } from "lucide-react";
import { getConnection } from '@/lib/db';
import { ClientesList } from '@/components/dashboard/clientes-list';

async function getClientsData() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
        c.IdCliente, c.NumeroDocumento, c.Nombre, c.NombreComercial, c.Direccion,
        c.Telefono, c.Email, c.Contacto, c.Estado, c.FechaRegistro,
        tc.IdTipoCliente, tc.Descripcion AS TipoCliente,
        td.IdTipoDocumento, td.Codigo AS TipoDocumento
      FROM Cliente c
      LEFT JOIN TipoCliente tc ON c.IdTipoCliente = tc.IdTipoCliente
      LEFT JOIN TipoDocumento td ON c.IdTipoDocumento = td.IdTipoDocumento
    `);
    return result.recordset.map(c => ({
      id: c.IdCliente,
      documentNumber: c.NumeroDocumento,
      name: c.Nombre,
      commercialName: c.NombreComercial,
      address: c.Direccion,
      phone: c.Telefono,
      email: c.Email,
      contact: c.Contacto,
      status: c.Estado,
      registeredAt: c.FechaRegistro,
      tipoCliente: { id: c.IdTipoCliente, descripcion: c.TipoCliente },
      tipoDocumento: { id: c.IdTipoDocumento, codigo: c.TipoDocumento }
    }));
  } catch (error) {
    console.error("Error fetching clients data:", error);
    return []; // Return an empty array in case of an error
  }
}

export default async function ClientesPage() {
  const clientsData = await getClientsData();

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
      <ClientesList initialData={clientsData} />
    </div>
  );
}
