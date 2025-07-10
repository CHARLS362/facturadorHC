'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { UserCog } from "lucide-react";
import { EditarUsuarioForm } from "@/components/dashboard/editar-usuario-form";

interface UsuarioData {
  id: number;
  fullName: string;
  email: string;
  role: "Admin" | "Vendedor" | "Soporte";
  status: "Activo" | "Inactivo";
}

export default function EditarUsuarioPage() {
  const params = useParams();
  const id = (params?.id ?? "") as string;
  // Validar que params e id no sean nulos o vacíos
  if (!params || !id) {
    return <p className="text-red-500">ID de usuario no válido.</p>;
  }
  const [userData, setUserData] = useState<UsuarioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/usuario/${id}`);
        if (!response.ok) {
          throw new Error('Error al obtener los datos del usuario.');
        }
        const rawData = await response.json();
        setUserData({
          id: rawData.IdUsuario,
          fullName: rawData.Nombre,
          email: rawData.Email,
          role: ["Admin", "Vendedor", "Soporte"].includes(rawData.Rol) ? rawData.Rol : "Vendedor",
          status: ["Activo", "Inactivo"].includes(rawData.Estado) ? rawData.Estado : "Activo",
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Editar Usuario: ${userData?.fullName || id}`}
        description="Modifique la información del usuario."
        icon={UserCog}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/usuarios">Volver al Listado</Link>
          </Button>
        }
      />
      {isLoading ? (
        <p>Cargando usuario...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : userData ? (
        <EditarUsuarioForm userId={userData.id.toString()} initialData={userData} />
      ) : null}
    </div>
  );
}
