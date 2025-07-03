
import { PageHeader } from "@/components/shared/page-header";
import { UserCog2 } from "lucide-react";
import { EditarClienteForm } from "@/components/dashboard/editar-cliente-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getConnection } from '@/lib/db';
import * as  sql  from 'mssql';
import { notFound } from 'next/navigation';

async function getClientData(id: string) {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('IdCliente', sql.Int, id)
      .query(`
        SELECT 
          c.IdCliente,
          c.NumeroDocumento,
          c.Nombre,
          c.NombreComercial,
          c.Direccion,
          c.Telefono,
          c.Email,
          c.Contacto,
          c.Estado,
          c.FechaRegistro,
          tc.Descripcion AS TipoCliente,
          td.Codigo AS TipoDocumento
        FROM Cliente c
        LEFT JOIN TipoCliente tc ON c.IdTipoCliente = tc.IdTipoCliente
        LEFT JOIN TipoDocumento td ON c.IdTipoDocumento = td.IdTipoDocumento
        WHERE c.IdCliente = @IdCliente
      `);

    if (result.recordset.length === 0) {
      return null;
    }
    return result.recordset[0];
  } catch (error) {
    console.error('Error fetching client data:', error);
    return null;
  }
}

export default async function EditarClientePage({ params }: { params: { id: string } }) {
  const clientData = await getClientData(params.id);

  if (!clientData) {
    notFound();
  }
  
  const initialData = {
    type: clientData.TipoCliente === "Persona Jurídica" ? "Empresa" : "Persona",
    name: clientData.Nombre || "",
    rucDni: clientData.NumeroDocumento || "",
    contactName: clientData.Contacto || "",
    email: clientData.Email || "",
    phone: clientData.Telefono || "",
    address: clientData.Direccion || "",
  };
  
  return (
    <div className="space-y-8">
      <PageHeader
        title={`Editar Cliente: ${initialData.name || params.id}`}
        description="Modifique la información del cliente."
        icon={UserCog2}
        actions={
            <Button variant="outline" asChild>
                <Link href="/dashboard/clientes">Volver al Listado</Link>
            </Button>
        }
      />
      <EditarClienteForm clientId={params.id} initialData={initialData} />
    </div>
  );
}
