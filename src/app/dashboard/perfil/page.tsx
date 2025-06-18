
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserCircle, Save, KeyRound, Eye, EyeOff, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import React, { useState } from "react";

const profileSchema = z.object({
  fullName: z.string().min(3, { message: "El nombre completo es requerido (mín. 3 caracteres)." }),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, { message: "La nueva contraseña debe tener al menos 8 caracteres." }).optional().or(z.literal('')),
  confirmNewPassword: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.newPassword && !data.currentPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Debe ingresar su contraseña actual para establecer una nueva.",
      path: ["currentPassword"],
    });
  }
  if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Las nuevas contraseñas no coinciden.",
      path: ["confirmNewPassword"],
    });
  }
  if (data.confirmNewPassword && !data.newPassword){
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Por favor, ingrese primero la nueva contraseña.",
      path: ["newPassword"],
    });
  }
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function PerfilPage() {
  const { toast } = useToast();
  const { user } = useAuth(); // Assuming useAuth provides current user info
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.name || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    console.log("Profile update data:", data);
    
    // Simulate API call
    // In a real app, you would verify currentPassword if newPassword is set
    if (data.newPassword && data.currentPassword === "wrongpassword") { // Mock incorrect current password
        await new Promise(resolve => setTimeout(resolve, 500));
        toast({
            title: "Error al Actualizar",
            description: "La contraseña actual es incorrecta.",
            variant: "destructive",
        });
        setIsSubmitting(false);
        form.setError("currentPassword", { type: "manual", message: "Contraseña actual incorrecta." });
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    toast({
      title: "Perfil Actualizado",
      description: "Tu información personal ha sido actualizada exitosamente.",
    });
    // Optionally, reset password fields after successful update
    form.reset({ ...form.getValues(), currentPassword: "", newPassword: "", confirmNewPassword: "" });
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Mi Perfil"
        description="Actualiza tu información personal y contraseña."
        icon={UserCircle}
      />
      <Card className="shadow-xl rounded-lg w-full border-border/50">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <UserCog className="h-6 w-6 text-primary"/> Información del Usuario
          </CardTitle>
          <CardDescription>Estos son los detalles de tu cuenta. Mantenlos actualizados.</CardDescription>
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
                      <Input placeholder="Ej: Juan Pérez Rodríguez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Card className="p-4 pt-2 bg-muted/30 border-border/30">
                <CardHeader className="p-0 mb-3">
                    <CardTitle className="text-lg font-headline flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-primary" /> Cambiar Contraseña (Opcional)
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Completa estos campos solo si deseas cambiar tu contraseña.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                    <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contraseña Actual</FormLabel>
                            <div className="relative">
                            <FormControl>
                                <Input 
                                type={showCurrentPassword ? "text" : "password"} 
                                placeholder="Tu contraseña actual" 
                                {...field}
                                className="pr-10" 
                                />
                            </FormControl>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nueva Contraseña</FormLabel>
                             <div className="relative">
                            <FormControl>
                                <Input 
                                type={showNewPassword ? "text" : "password"} 
                                placeholder="Mínimo 8 caracteres" 
                                {...field} 
                                className="pr-10"
                                />
                            </FormControl>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmNewPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                            <div className="relative">
                            <FormControl>
                                <Input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="Repite tu nueva contraseña" 
                                {...field} 
                                className="pr-10"
                                />
                            </FormControl>
                             <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
              </Card>


              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Actualizar Perfil
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
