"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Warehouse, Save, RotateCcw, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

const ALMACENES_STORAGE_KEY = 'facturacionhc_mock_almacenes';

const almacenSchema = z.object({
  nombre: z.string().min(3, { message: "El nombre es requerido (mín. 3 caracteres)." }),
  direccion: z.string().min(5, { message: "La dirección es requerida (mín. 5 caracteres)." }),
});

type AlmacenFormValues = z.infer<typeof almacenSchema>;

export default function NuevoAlmacenPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AlmacenFormValues>({
    resolver: zodResolver(almacenSchema),
    defaultValues: {
      nombre: "",
      direccion: "",
    },
  });

  async function onSubmit(data: AlmacenFormValues) {
    setIsSubmitting(true);
    
    // Simulate API call with a short delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const storedAlmacenes = localStorage.getItem(ALMACENES_STORAGE_KEY);
      const almacenes = storedAlmacenes ? JSON.parse(storedAlmacenes) : [];
      
      const nuevoAlmacen = {
        IdAlmacen: new Date().getTime(), // Use timestamp for a unique ID in simulation
        Nombre: data.nombre,
        Direccion: data.direccion,
        Estado: true, // Active by default
      };

      const updatedAlmacenes = [...almacenes, nuevoAlmacen];
      localStorage.setItem(ALMACENES_STORAGE_KEY, JSON.stringify(updatedAlmacenes));
      
      toast({
        variant: "success",
        title: <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-white" /><span>Almacén Creado</span></div>,
        description: `El almacén ${data.nombre} ha sido creado exitosamente (simulación).`,
      });

      router.push("/dashboard/almacenes");

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el almacén en el almacenamiento local.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Añadir Nuevo Almacén"
        description="Ingrese la información de la nueva sucursal o depósito."
        icon={Warehouse}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/almacenes">Volver al Listado</Link>
          </Button>
        }
      />
      <Card className="shadow-xl rounded-lg w-full max-w-2xl mx-auto border-border/50">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Información del Almacén</CardTitle>
          <CardDescription>Complete los campos para registrar el nuevo almacén.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Almacén</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Almacén Principal, Tienda Centro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ej: Av. El Sol 123, Lima, Perú" {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Limpiar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Crear Almacén
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
