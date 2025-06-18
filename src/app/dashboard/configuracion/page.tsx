
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, Building, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import Image from "next/image";

const companySettingsSchema = z.object({
  companyName: z.string().min(3, { message: "El nombre de la empresa es requerido (mín. 3 caracteres)." }),
  companyAddress: z.string().min(10, { message: "La dirección es requerida (mín. 10 caracteres)." }),
  companyLogoUrl: z.string().url({ message: "Ingrese una URL válida para el logo." }).optional().or(z.literal('')),
});

type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;

// Mock data - in a real app, this would come from an API or global state
const mockCompanySettings = {
  companyName: "FacturacionHC Predeterminada S.A.C.",
  companyAddress: "Av. La Innovación 123, Distrito Tecnológico, Lima, Perú",
  companyLogoUrl: "https://placehold.co/200x80.png?text=Mi+Logo",
};

export default function ConfiguracionPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      companyName: mockCompanySettings.companyName || "",
      companyAddress: mockCompanySettings.companyAddress || "",
      companyLogoUrl: mockCompanySettings.companyLogoUrl || "",
    },
  });

  const logoUrl = form.watch("companyLogoUrl");

  async function onSubmit(data: CompanySettingsFormValues) {
    setIsSubmitting(true);
    console.log("Company settings updated:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    toast({
      title: "Configuración Guardada",
      description: "La información de la empresa ha sido actualizada exitosamente.",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Configuración General"
        description="Actualiza los datos de tu empresa y preferencias de la aplicación."
        icon={Settings}
      />
      <Card className="shadow-xl rounded-lg w-full border-border/50">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" /> Información de la Empresa
          </CardTitle>
          <CardDescription>Define los datos principales de tu negocio que aparecerán en facturas y otros documentos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Empresa / Razón Social</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Tu Empresa S.A.C." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección Fiscal Completa</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ej: Av. Siempreviva 742, Springfield" {...field} rows={3}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyLogoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Logo de la Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ejemplo.com/logo.png" {...field} />
                    </FormControl>
                    <FormDescription>
                      El logo se mostrará en las plantillas de factura. Asegúrate que sea accesible públicamente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {logoUrl && (
                <div className="mt-4 p-4 border rounded-md bg-muted/50">
                  <FormLabel className="mb-2 block">Vista Previa del Logo:</FormLabel>
                  <Image 
                    src={logoUrl} 
                    alt="Vista previa del logo" 
                    width={200} 
                    height={80} 
                    className="rounded-md object-contain border bg-background"
                    data-ai-hint="company logo"
                    onError={(e) => {
                      // Optionally handle image load errors, e.g., show a placeholder
                      e.currentTarget.src = "https://placehold.co/200x80.png?text=Error+Logo";
                    }}
                  />
                </div>
              )}
               {!logoUrl && (
                <div className="mt-4 p-4 border rounded-md bg-muted/50 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No hay URL de logo configurada.</p>
                    <p className="text-xs text-muted-foreground">
                      Puedes usar <a href="https://placehold.co/" target="_blank" rel="noopener noreferrer" className="underline text-primary">placehold.co</a> para generar un logo temporal.
                    </p>
                </div>
              )}


              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Guardar Configuración
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
