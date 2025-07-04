
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
import { Settings, Save, Building, ImageUp, Image as ImageIcon, XCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

const companySettingsSchema = z.object({
  companyName: z.string().min(3, { message: "El nombre de la empresa es requerido (mín. 3 caracteres)." }),
  companyRuc: z.string().length(11, { message: "El RUC debe tener 11 dígitos." }).refine(val => /^\d+$/.test(val), { message: "El RUC solo debe contener números." }),
  companyAddress: z.string().min(10, { message: "La dirección es requerida (mín. 10 caracteres)." }),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email({ message: "Ingrese un correo válido." }).optional().or(z.literal('')),
  companyLogoUrl: z.string().url({ message: "Ingrese una URL válida para el logo." }).optional().or(z.literal('')),
  companyLogoFile: z
    .custom<FileList>((val) => val === null || val instanceof FileList, "Se esperaba un archivo.")
    .optional()
    .nullable()
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      `El tamaño máximo del archivo es 2MB.`
    )
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type),
      "Solo se permiten archivos .jpg, .jpeg, .png, .svg y .webp."
    ),
});

type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;

// Mock data as fallback
const mockCompanySettings = {
  companyName: "FacturacionHC Predeterminada S.A.C.",
  companyRuc: "20123456789",
  companyAddress: "Av. La Innovación 123, Distrito Tecnológico, Lima, Perú",
  companyPhone: "(01) 555-1234",
  companyEmail: "ventas@facturacionhc.com",
  companyLogoUrl: "https://placehold.co/240x70.png",
};


export default function ConfiguracionPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const form = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      companyName: "",
      companyRuc: "",
      companyAddress: "",
      companyPhone: "",
      companyEmail: "",
      companyLogoUrl: "",
      companyLogoFile: null,
    },
  });
  
  // Load saved settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('companySettings');
      const initialValues = savedSettings ? JSON.parse(savedSettings) : mockCompanySettings;
      form.reset({
          companyName: initialValues.companyName || "",
          companyRuc: initialValues.companyRuc || "",
          companyAddress: initialValues.companyAddress || "",
          companyPhone: initialValues.companyPhone || "",
          companyEmail: initialValues.companyEmail || "",
          companyLogoUrl: initialValues.companyLogoUrl || "",
          companyLogoFile: null
      });
      setLogoPreview(initialValues.companyLogoUrl || null);
    } catch (e) {
      console.error("Failed to load company settings, using fallback.", e);
      form.reset(mockCompanySettings);
      setLogoPreview(mockCompanySettings.companyLogoUrl);
    }
  }, [form]);


  const watchedLogoUrl = form.watch("companyLogoUrl");
  const watchedLogoFile = form.watch("companyLogoFile");

  useEffect(() => {
    if (watchedLogoFile && watchedLogoFile.length > 0) {
      const file = watchedLogoFile[0];
      if (ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setLogoPreview(watchedLogoUrl || null); 
      }
    } else if (watchedLogoUrl) {
      setLogoPreview(watchedLogoUrl);
    } else {
      setLogoPreview(null);
    }
  }, [watchedLogoUrl, watchedLogoFile, toast]);

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  async function onSubmit(data: CompanySettingsFormValues) {
    setIsSubmitting(true);
    
    let logoUrlToSave = data.companyLogoUrl;

    try {
        if (data.companyLogoFile && data.companyLogoFile.length > 0) {
            logoUrlToSave = await fileToDataUrl(data.companyLogoFile[0]);
        }

        const settingsToSave = {
            companyName: data.companyName,
            companyRuc: data.companyRuc,
            companyAddress: data.companyAddress,
            companyPhone: data.companyPhone,
            companyEmail: data.companyEmail,
            companyLogoUrl: logoUrlToSave
        };

        localStorage.setItem('companySettings', JSON.stringify(settingsToSave));

        form.reset({
            ...data,
            companyLogoUrl: logoUrlToSave,
            companyLogoFile: null // Clear file input after saving
        });

        toast({
          variant: "success",
          title: (
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 p-1 bg-emerald-500 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <span>Configuración Guardada</span>
            </div>
          ),
          description: "La información de la empresa ha sido actualizada exitosamente.",
        });

    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error al guardar",
            description: "No se pudo procesar y guardar la imagen. Por favor, intente de nuevo."
        });
    } finally {
        setIsSubmitting(false);
    }
  }


  const handleRemoveFile = () => {
    form.setValue("companyLogoFile", null, { shouldValidate: true });
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Configuración General"
        description="Actualiza los datos de tu empresa y preferencias de la aplicación."
        icon={Settings}
      />
      <Card className="shadow-xl rounded-lg w-full max-w-3xl mx-auto border-border/50">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" /> Información de la Empresa
          </CardTitle>
          <CardDescription>Define los datos principales de tu negocio que aparecerán en facturas y otros documentos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
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
                    name="companyRuc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RUC</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: 20123456789" {...field} maxLength={11} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>

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

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de Contacto (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: (01) 555-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de Contacto (Opcional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Ej: contacto@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-2 p-4 border rounded-md bg-muted/30">
                <h3 className="text-md font-medium text-foreground mb-1">Logo de la Empresa</h3>
                <FormField
                  control={form.control}
                  name="companyLogoFile"
                  render={({ field: { onChange, value, ...restField } }) => (
                    <FormItem>
                      <FormLabel htmlFor="companyLogoFile-input" className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                        <ImageUp className="h-5 w-5" />
                        Subir logo desde dispositivo (JPG, PNG, SVG, WEBP - Máx 2MB)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          id="companyLogoFile-input"
                          type="file" 
                          accept={ACCEPTED_IMAGE_TYPES.join(",")}
                          onChange={(e) => onChange(e.target.files)}
                          className="hidden"
                          {...restField} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchedLogoFile && watchedLogoFile.length > 0 && (
                  <Button type="button" variant="outline" size="sm" onClick={handleRemoveFile} className="mt-1 text-destructive hover:text-destructive/80 border-destructive/50 hover:border-destructive/80">
                    <XCircle className="mr-2 h-4 w-4" />
                    Quitar archivo seleccionado
                  </Button>
                )}

                <p className="text-xs text-center text-muted-foreground py-1"> O </p>
                
                <FormField
                  control={form.control}
                  name="companyLogoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">Usar URL del Logo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://ejemplo.com/logo.png" 
                          {...field} 
                          disabled={!!(watchedLogoFile && watchedLogoFile.length > 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        El logo se mostrará en las plantillas de factura. Si sube un archivo, esta URL será ignorada.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


              {logoPreview ? (
                <div className="mt-4 p-4 border rounded-md bg-muted/50">
                  <FormLabel className="mb-2 block">Vista Previa del Logo:</FormLabel>
                  <div className="h-[80px] w-[200px]">
                     <Image 
                      src={logoPreview} 
                      alt="Vista previa del logo" 
                      width={200} 
                      height={80} 
                      className="rounded-md object-contain border bg-background h-full w-auto"
                      data-ai-hint="company logo preview"
                      onError={() => {
                        setLogoPreview(null);
                        toast({ variant: "destructive", title: "Error al cargar URL del logo", description: "La URL proporcionada no es una imagen válida."})
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-4 border rounded-md bg-muted/50 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No hay logo configurado para la vista previa.</p>
                    <p className="text-xs text-muted-foreground">
                      Puede subir un archivo o usar <a href="https://placehold.co/" target="_blank" rel="noopener noreferrer" className="underline text-primary">placehold.co</a> para una URL temporal.
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
