
import Link from 'next/link';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileDown, Users } from "lucide-react";
import { getConnection } from '@/lib/db';
import { UsuariosList } from '@/components/dashboard/usuarios-list';

async function getUsersData() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
        u.IdUsuario, u.Nombre, u.Email, r.Nombre AS Rol, 
        u.FechaRegistro AS FechaIngreso, 
        CASE WHEN u.Estado = 1 THEN 'Activo' ELSE 'Inactivo' END AS Estado
      FROM Usuario u
      LEFT JOIN Rol r ON u.IdRol = r.IdRol
    `);

    return result.recordset.map((usuario: any) => ({
      id: usuario.IdUsuario, 
      name: usuario.Nombre,
      email: usuario.Email,
      role: usuario.Rol,
      joinedDate: new Date(usuario.FechaIngreso).toLocaleDateString('es-PE'),
      status: usuario.Estado,
    }));
  } catch (error) {
    console.error("Error fetching users data:", error);
    return [];
  }
}

export default async function UsuariosPage() {
  const usersData = await getUsersData();

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestión de Usuarios"
        description="Administra los usuarios del sistema, roles y permisos."
        icon={Users}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/usuarios/exportar">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/usuarios/nuevo">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Usuario
              </Link>
            </Button>
          </div>
        }
      />
      <UsuariosList initialData={usersData} />
    </div>
  );
}
