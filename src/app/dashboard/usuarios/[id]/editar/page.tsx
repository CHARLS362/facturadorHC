
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
import { UserCog, Save, RotateCcw, Eye, EyeOff } from "lucide-react"; // Changed icon to UserCog
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation'; // For accessing route params

// Mock data - in a real app, this would come from an API
const mockUsers = [
  { id: "USR001", fullName: "Ana García", email: "ana.garcia@example.com", role: "Admin", status: "Activo" },
  { id: "USR002", fullName: "Carlos López", email: "carlos.lopez@example.com", role: "Vendedor", status: "Activo" },
];


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
    // Simulate fetching user data
    if (userId) {
      const userToEdit = mockUsers.find(u => u.id === userId);
      if (userToEdit) {
        form.reset({
          fullName: userToEdit.fullName,
          email: userToEdit.email,
          password: "", // Password field should be empty or handled differently for edits
          role: userToEdit.role as "Admin" | "Vendedor" | "Soporte",
          status: userToEdit.status as "Activo" | "Inactivo",
        });
      } else {
        toast({ title: "Error", description: "Usuario no encontrado.", variant: "destructive" });
        router.push("/dashboard/usuarios");
      }
    }
  }, [userId, form, router, toast]);

  async function onSubmit(data: UsuarioFormValues) {
    setIsSubmitting(true);
    console.log("Updating user:", userId, data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    toast({
      title: "Usuario Actualizado",
      description: `El usuario ${data.fullName} ha sido actualizado exitosamente.`,
      variant: "default",
    });
    // Optionally, redirect after update
    // router.push("/dashboard/usuarios"); 
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
      <Card className="shadow-xl rounded-lg w-full border-border/50">
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
