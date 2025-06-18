
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserCog2, Save, RotateCcw, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';

// Mock data - in a real app, this would come from an API
const mockClients = [
  { id: "CLI001", type: "Empresa", name: "Empresa XYZ S.A.C.", rucDni: "20123456789", contactName: "Juan Pérez", email: "juan.perez@empresa.xyz", phone: "987654321", address: "Av. Principal 123, Lima" },
  { id: "CLI002", type: "Persona", name: "Ana Morales", rucDni: "12345678", contactName: "Ana Morales", email: "ana.morales@personal.com", phone: "912345678", address: "Calle Falsa 123, Miraflores" },
];

const clientSchema = z.object({
  type: z.enum(["Empresa", "Persona"], { required_error: "Seleccione el tipo de cliente." }),
  name: z.string().min(3, { message: "El nombre o razón social es requerido (mín. 3 caracteres)." }),
  rucDni: z.string().min(8, { message: "RUC/DNI es requerido (mín. 8 caracteres)." })
           .refine(val => /^\d+$/.test(val), { message: "RUC/DNI solo debe contener números." }),
  contactName: z.string().optional(),
  email: z.string().email({ message: "Ingrese un email válido." }).optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.type === "Persona" && data.rucDni.length !== 8) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "DNI debe tener 8 dígitos.", path: ["rucDni"] });
    }
    if (data.type === "Empresa" && data.rucDni.length !== 11) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "RUC debe tener 11 dígitos.", path: ["rucDni"] });
    }
    if (data.type === "Empresa" && !data.contactName) {
         ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nombre de contacto es requerido para empresas.", path: ["contactName"] });
    }
});


type ClientFormValues = z.infer<typeof clientSchema>;

export default function EditarClientePage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      type: undefined,
      name: "",
      rucDni: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
    },
  });
  
  const clientType = form.watch("type");

  useEffect(() => {
    if (clientId) {
      // Simulate fetching client data
      const clientToEdit = mockClients.find(c => c.id === clientId);
      if (clientToEdit) {
        form.reset({
          ...clientToEdit,
          type: clientToEdit.type as ClientFormValues["type"], // Ensure correct type
        });
      } else {
        toast({ title: "Error", description: "Cliente no encontrado.", variant: "destructive" });
        router.push("/dashboard/clientes");
      }
    }
  }, [clientId, form, router, toast]);

  async function onSubmit(data: ClientFormValues) {
    setIsSubmitting(true);
    console.log("Updating client:", clientId, data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    toast({
      variant: "success",
      title: (
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 p-1 bg-emerald-500 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <span>Cliente Actualizado</span>
        </div>
      ),
      description: `El cliente ${data.name} ha sido actualizado exitosamente.`,
    });
    // router.push("/dashboard/clientes");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Editar Cliente: ${form.getValues("name") || clientId}`}
        description="Modifique la información del cliente."
        icon={UserCog2}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/clientes">Volver al Listado</Link>
          </Button>
        }
      />
      <Card className="shadow-xl rounded-lg w-full max-w-3xl mx-auto border-border/50">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Información del Cliente</CardTitle>
          <CardDescription>Actualice los campos necesarios.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Cliente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Persona">Persona Natural</SelectItem>
                        <SelectItem value="Empresa">Empresa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{clientType === "Persona" ? "Nombres y Apellidos" : "Razón Social"}</FormLabel>
                    <FormControl>
                      <Input placeholder={clientType === "Persona" ? "Ej: Juan Alberto Pérez Gómez" : "Ej: Acme Corp S.A.C."} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rucDni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{clientType === "Persona" ? "DNI" : "RUC"}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={clientType === "Persona" ? "8 dígitos" : "11 dígitos"} 
                        {...field} 
                        maxLength={clientType === "Persona" ? 8 : 11}
                        onChange={(e) => {
                            const { value } = e.target;
                            if (/^\d*$/.test(value)) { field.onChange(value); }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {clientType === "Empresa" && (
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Contacto (Empresa)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Ana Torres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico {clientType === "Persona" ? "" : "(del Contacto)"} (Opcional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="ej: contacto@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono {clientType === "Persona" ? "" : "(del Contacto)"} (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 987654321" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ej: Av. La Marina 123, San Miguel, Lima" {...field} rows={3}/>
                    </FormControl>
                    <FormMessage />
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
    </div>
  );
}
