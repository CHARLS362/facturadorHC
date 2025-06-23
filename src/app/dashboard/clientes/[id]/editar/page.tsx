
import { PageHeader } from "@/components/shared/page-header";
import { UserCog2 } from "lucide-react";
import { getConnection } from '@/lib/db';
import sql from 'mssql';
import { EditarClienteForm } from "@/components/dashboard/editar-cliente-form";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getClientData(id: string) {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('IdCliente', sql.Int, id)
      .query(`
        SELECT 
          c.IdCliente, c.NumeroDocumento, c.Nombre, c.NombreComercial, c.Direccion,
          c.Telefono, c.Email, c.Contacto, c.Estado,
          tc.Descripcion AS TipoCliente
        FROM Cliente c
        LEFT JOIN TipoCliente tc ON c.IdTipoCliente = tc.IdTipoCliente
        WHERE c.IdCliente = @IdCliente
      `);

    if (result.recordset.length === 0) {
      return null;
    }
    return result.recordset[0];
  } catch (error) {
    console.error("Failed to fetch client:", error);
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
        title={`Editar Cliente: ${clientData.Nombre || params.id}`}
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
