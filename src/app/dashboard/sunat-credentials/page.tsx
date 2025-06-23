
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { KeyRound, Save, Eye, EyeOff, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const credentialsSchema = z.object({
  solUser: z.string().min(1, { message: "El Usuario SOL es requerido." }),
  solPassword: z.string().min(1, { message: "La Clave SOL es requerida." }),
});

type CredentialsFormValues = z.infer<typeof credentialsSchema>;

export default function SunatCredentialsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<CredentialsFormValues>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      solUser: "",
      solPassword: "",
    },
  });

  async function onSubmit(data: CredentialsFormValues) {
    setIsSubmitting(true);
    
    // --- SECURITY WARNING ---
    // In a real application, these credentials should be sent over HTTPS
    // to a secure backend endpoint and stored encrypted, ideally using a
    // dedicated secrets manager (like Google Secret Manager, AWS Secrets Manager, etc.).
    // Storing them in a regular database column is NOT recommended.
    console.log("Submitting SUNAT credentials:", data);
    
    // Simulate API call to save credentials
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);

    toast({
      variant: "success",
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-white" />
          <span>Credenciales Guardadas (Simulación)</span>
        </div>
      ),
      description: "Tus credenciales de SUNAT han sido guardadas de forma segura.",
    });
    
    // It's good practice to clear password fields after submission
    form.reset({ ...form.getValues(), solPassword: "" });
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Credenciales SUNAT"
        description="Gestiona tu Usuario y Clave SOL para la facturación electrónica."
        icon={KeyRound}
      />

      <Alert variant="destructive" className="max-w-3xl mx-auto border-yellow-500/50 text-yellow-600 dark:text-yellow-400 [&>svg]:text-yellow-500">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>¡Atención! Zona de Alta Seguridad</AlertTitle>
        <AlertDescription>
          Estás en una sección crítica. La información aquí guardada es extremadamente sensible. Asegúrate de no compartir tu Clave SOL con nadie.
        </AlertDescription>
      </Alert>

      <Card className="shadow-xl rounded-lg w-full max-w-3xl mx-auto border-border/50">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Configuración de Credenciales</CardTitle>
          <CardDescription>Estos datos son necesarios para firmar y enviar tus comprobantes a la SUNAT.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="solUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario SOL</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu usuario de SUNAT Operaciones en Línea" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="solPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clave SOL</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Tu contraseña de SUNAT" 
                          {...field} 
                          className="pr-10"
                        />
                      </FormControl>
                      <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => setShowPassword(!showPassword)}
                      >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Guardar Credenciales
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
