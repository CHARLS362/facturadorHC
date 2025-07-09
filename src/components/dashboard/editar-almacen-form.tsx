
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import React, { useState } from "react";

const almacenSchema = z.object({
  Nombre: z.string().min(3, { message: "El nombre es requerido (mín. 3 caracteres)." }),
  Direccion: z.string().min(5, { message: "La dirección es requerida (mín. 5 caracteres)." }),
  Estado: z.boolean().default(true),
});

type AlmacenFormValues = z.infer<typeof almacenSchema>;

interface EditarAlmacenFormProps {
  almacenId: string;
  initialData: AlmacenFormValues;
}

export function EditarAlmacenForm({ almacenId, initialData }: EditarAlmacenFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<AlmacenFormValues>({
    resolver: zodResolver(almacenSchema),
    defaultValues: initialData,
  });

  async function onSubmit(data: AlmacenFormValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/almacen/${almacenId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "No se pudo actualizar el almacén.");
      }

      toast({
        variant: "success",
        title: <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-white" /><span>Almacén Actualizado</span></div>,
        description: `El almacén ${data.Nombre} ha sido actualizado exitosamente.`,
      });
      
      router.push("/dashboard/almacenes");
      router.refresh();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="shadow-xl rounded-lg w-full max-w-2xl mx-auto border-border/50">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Información del Almacén</CardTitle>
        <CardDescription>Actualice los campos necesarios.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="Nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Almacén</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Almacén Principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Direccion"
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
            <FormField
              control={form.control}
              name="Estado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Estado</FormLabel>
                    <FormDescription>
                      {field.value ? 'Activo. El almacén está operativo.' : 'Inactivo. El almacén está cerrado.'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
