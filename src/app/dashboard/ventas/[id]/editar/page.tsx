
"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileEdit, Eye } from "lucide-react"; // Changed Icon
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import React from "react";

// This page is NO LONGER USED and will be deleted.
// It's replaced by src/app/dashboard/ventas/[id]/detalles/page.tsx
// Keeping this content temporarily to avoid breaking imports if any,
// but it should be removed in the next step or cleanup.

export default function DEPRECATED_EditarVentaPage() {
  const router = useRouter();
  const params = useParams();
  const ventaId = params.id as string;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`DEPRECATED Editar Venta: ${ventaId}`}
        description="Esta página será eliminada. La edición de ventas se maneja de otra forma."
        icon={FileEdit}
        actions={
            <Button variant="outline" asChild>
                <Link href="/dashboard/ventas">Volver al Listado</Link>
            </Button>
        }
      />
      <Card className="shadow-xl rounded-lg w-full max-w-3xl mx-auto border-border/50">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Detalles de la Venta {ventaId}</CardTitle>
          <CardDescription>
            Esta página ha sido reemplazada por una página de solo visualización de detalles.
            Las ventas no se editan directamente; se anulan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Redirigir a <Link href={`/dashboard/ventas/${ventaId}/detalles`} className="text-primary underline">detalles de la venta</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

