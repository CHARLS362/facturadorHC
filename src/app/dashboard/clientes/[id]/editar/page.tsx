
"use client";

import { PageHeader } from "@/components/shared/page-header";
import { UserCog2 } from "lucide-react";
import { EditarClienteForm } from "@/components/dashboard/editar-cliente-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<any | null>(null);

  useEffect(() => {
    if (clientId) {
      setIsLoading(true);
      fetch(`/api/cliente/${clientId}`)
        .then(res => {
          if (!res.ok) throw new Error("Cliente no encontrado");
          return res.json();
        })
        .then(clientData => {
          if (clientData && !clientData.error) {
            const dataForForm = {
              type: clientData.TipoCliente === "Persona Jurídica" ? "Empresa" : "Persona",
              name: clientData.Nombre || "",
              rucDni: clientData.NumeroDocumento || "",
              contactName: clientData.Contacto || "",
              email: clientData.Email || "",
              phone: clientData.Telefono || "",
              address: clientData.Direccion || "",
            };
            setInitialData(dataForForm);
          } else {
            throw new Error("Cliente no encontrado");
          }
        })
        .catch(() => {
          toast({ title: "Error", description: "Cliente no encontrado.", variant: "destructive" });
          router.push("/dashboard/clientes");
        })
        .finally(() => setIsLoading(false));
    }
  }, [clientId, router, toast]);
  
  if (isLoading || !initialData) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Editar Cliente"
          description="Cargando la información del cliente..."
          icon={UserCog2}
        />
        <Card className="shadow-xl rounded-lg w-full max-w-3xl mx-auto border-border/50">
          <CardHeader>
            <CardTitle><Skeleton className="h-8 w-64" /></CardTitle>
            <CardDescription><Skeleton className="h-4 w-48" /></CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-full" /></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Editar Cliente: ${initialData.name || clientId}`}
        description="Modifique la información del cliente."
        icon={UserCog2}
        actions={
            <Button variant="outline" asChild>
                <Link href="/dashboard/clientes">Volver al Listado</Link>
            </Button>
        }
      />
      <EditarClienteForm clientId={clientId} initialData={initialData} />
    </div>
  );
}
