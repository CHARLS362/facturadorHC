
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
import { UserCog, Save, RotateCcw, Eye, EyeOff, CheckCircle2 } from "lucide-react"; // Changed icon to UserCog
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation'; // For accessing route params

const usuarioSchema = z.object({
  fullName: z.string().min(3, { message: "El nombre completo es requerido (mín. 3 caracteres)." }),
  email: z.string().email({ message: "Ingrese un email válido." }),
  // Password can be optional on edit, or have different validation
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }).optional().or(z.literal('')),
  role: z.enum(["Admin", "Vendedor", "Soporte"], { required_error: "Seleccione un rol para el usuario." }),
  status: z.enum(["Activo", "Inactivo"], { required_error: "Seleccione un estado."}),
});

type UsuarioFormValues = z.infer<typeof usuarioSchema>;

export default function EditarUsuarioPage() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string; // Get user ID from URL

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: undefined,
      status: "Activo",
    },
  });
  


useEffect(() => {
  const fetchUsuario = async () => {
    try {
      const res = await fetch(`/api/usuario/${userId}`);
      if (!res.ok) throw new Error("Usuario no encontrado");
      const data = await res.json();

      form.reset({
        fullName: data.Nombre,
        email: data.Email,
        password: "",
        role: data.Rol,
        status: data.Estado,
      });
    } catch (error) {
      toast({ title: "Error", description: "Usuario no encontrado.", variant: "destructive" });
      router.push("/dashboard/usuarios");
    }
  };

  if (userId) fetchUsuario();
}, [userId, form, router, toast]);


async function onSubmit(data: UsuarioFormValues) {
  setIsSubmitting(true);
  try {
    const body = {
      Nombre: data.fullName,
      Email: data.email,
      Rol: data.role,
      Estado: data.status,
    };

    // Solo incluir password si fue escrita
    if (data.password && data.password.trim() !== "") {
      body["Password"] = data.password;
    }

    const res = await fetch(`/api/usuario/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("Error al actualizar");

    toast({
      variant: "success",
      title: (
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 p-1 bg-emerald-500 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <span>Usuario actualizado</span>
        </div>
      ),
      description: `El usuario ${data.fullName} ha sido actualizado correctamente.`,
    });

  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error al actualizar",
      description: "Hubo un problema al actualizar el usuario.",
    });
  } finally {
    setIsSubmitting(false);
  }
}


  return (
    <div className="space-y-8">
      <PageHeader
        title={`Editar Usuario: ${form.getValues("fullName") || userId}`}
        description="Modifique la información del usuario."
        icon={UserCog}
        actions={
            <Button variant="outline" asChild>
                <Link href="/dashboard/usuarios">Volver al Listado</Link>
            </Button>
        }
      />
      <Card className="shadow-xl rounded-lg w-full max-w-3xl mx-auto border-border/50">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Información del Usuario</CardTitle>
          <CardDescription>Actualice los campos necesarios.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Ana Sofía García" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ej: ana.garcia@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña (Opcional)</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Dejar en blanco para no cambiar" 
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
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol del Usuario</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Admin">Administrador</SelectItem>
                          <SelectItem value="Vendedor">Vendedor</SelectItem>
                          <SelectItem value="Soporte">Soporte</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="Inactivo">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
