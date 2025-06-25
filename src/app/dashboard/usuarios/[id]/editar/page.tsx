
import { PageHeader } from "@/components/shared/page-header";
import { UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getConnection } from '@/lib/db';
import { sql } from 'mssql';
import { notFound } from 'next/navigation';
import { EditarUsuarioForm } from "@/components/dashboard/editar-usuario-form";

async function getUserData(id: string) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('Id', sql.Int, parseInt(id))
      .query(`
        SELECT 
          u.IdUsuario, u.Nombre, u.Email, r.Nombre AS Rol, 
          u.FechaRegistro AS FechaIngreso, 
          CASE WHEN u.Estado = 1 THEN 'Activo' ELSE 'Inactivo' END AS Estado
        FROM Usuario u
        LEFT JOIN Rol r ON u.IdRol = r.IdRol
        WHERE u.IdUsuario = @Id
      `);
    
    if (result.recordset.length === 0) {
      return null;
    }
    return result.recordset[0];
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export default async function EditarUsuarioPage({ params }: { params: { id: string } }) {
  const userData = await getUserData(params.id);
  if (!userData) {
    notFound();
  }

  const initialData = {
    fullName: userData.Nombre,
    email: userData.Email,
    password: "", // Password field is for changing, not displaying
    role: userData.Rol,
    status: userData.Estado,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Editar Usuario: ${initialData.fullName || params.id}`}
        description="Modifique la información del usuario."
        icon={UserCog}
        actions={
            <Button variant="outline" asChild>
                <Link href="/dashboard/usuarios">Volver al Listado</Link>
            </Button>
        }
      />
      <EditarUsuarioForm userId={params.id} initialData={initialData} />
    </div>
  );
}
