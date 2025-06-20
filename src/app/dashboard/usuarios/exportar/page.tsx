"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, FileDown } from "lucide-react";
import { UserExportPreview, type MockUser } from '@/components/dashboard/user-export-preview';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExportarUsuariosPage() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsuarios = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/usuario');
        if (!res.ok) throw new Error("Error al cargar los usuarios");
        const data = await res.json();
        const usuariosTransformados: MockUser[] = data.map((usuario: any) => ({
          id: usuario.IdUsuario,
          name: usuario.Nombre,
          email: usuario.Email,
          role: usuario.Rol,
          joinedDate: new Date(usuario.FechaIngreso).toLocaleDateString('es-PE'),
          status: usuario.Estado,
        }));
        setUsers(usuariosTransformados);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        // Handle error with a toast or message
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  return (
    <div className="space-y-8">
      <div className="print-hide">
        <PageHeader
          title="Previsualización de Exportación"
          description="Revisa el reporte de usuarios antes de imprimir o descargar."
          icon={FileDown}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <Button onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Descargar / Imprimir
              </Button>
            </div>
          }
        />
      </div>

      {isLoading ? (
        <div className="p-10 border rounded-lg bg-card">
           <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="h-12 w-12" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
        </div>
      ) : (
        <UserExportPreview users={users} />
      )}
    </div>
  );
}
