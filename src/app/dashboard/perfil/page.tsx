
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserCircle, Save, KeyRound, Eye, EyeOff, UserCog, CheckCircle2, ImageUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const profileSchema = z.object({
  fullName: z.string().min(3, { message: "El nombre completo es requerido (mín. 3 caracteres)." }),
  profilePicture: z
    .custom<FileList>((val) => val === null || val instanceof FileList, "Se esperaba un archivo.")
    .optional()
    .nullable()
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      `El tamaño máximo del archivo es 2MB.`
    )
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type),
      "Solo se permiten archivos .jpg, .jpeg, .png y .webp."
    ),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, { message: "La nueva contraseña debe tener al menos 8 caracteres." }).optional().or(z.literal('')),
  confirmNewPassword: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.newPassword && !data.currentPassword) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe ingresar su contraseña actual para establecer una nueva.", path: ["currentPassword"] });
  }
  if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Las nuevas contraseñas no coinciden.", path: ["confirmNewPassword"] });
  }
  if (data.confirmNewPassword && !data.newPassword){
     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Por favor, ingrese primero la nueva contraseña.", path: ["newPassword"] });
  }
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function PerfilPage() {
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [clientMounted, setClientMounted] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "", 
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      profilePicture: null,
    },
  });
  
  useEffect(() => {
    if (clientMounted && user) {
      form.reset({
        fullName: user.name || "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
        profilePicture: null,
      });
      setImagePreview(user.avatarUrl || null);
    }
  }, [clientMounted, user, form]);

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const watchedPicture = form.watch("profilePicture");
  useEffect(() => {
    if (watchedPicture && watchedPicture.length > 0) {
      const file = watchedPicture[0];
      fileToDataUrl(file).then(setImagePreview);
    }
  }, [watchedPicture]);

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    
    try {
      let newAvatarUrl = user?.avatarUrl || null;
      if (data.profilePicture && data.profilePicture.length > 0) {
        newAvatarUrl = await fileToDataUrl(data.profilePicture[0]);
      }

      // Here you would normally have an API call.
      // We simulate it and then update the auth context.
      if (data.newPassword) {
        // Mock password validation
        if (data.currentPassword !== 'password123') { // Replace with a real check
          toast({ variant: "destructive", title: "Contraseña incorrecta", description: "La contraseña actual no es válida."});
          setIsSubmitting(false);
          return;
        }
        console.log("Password would be updated.");
      }
      
      const updatedUser = {
        ...user,
        name: data.fullName,
        avatarUrl: newAvatarUrl,
      };

      // Update user in context and storage
      updateUser(updatedUser);

      toast({
        variant: "success",
        title: <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-white" /><span>Perfil Actualizado</span></div>,
        description: "Tu información personal ha sido actualizada exitosamente.",
      });

      form.reset({
        ...form.getValues(),
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
        profilePicture: null,
      });

    } catch (error: any) {
       toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "No se pudo actualizar el perfil.",
       });
    } finally {
        setIsSubmitting(false);
    }
  }

  const getInitials = (name?: string): string => {
    if (!name || name.trim() === "") return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Mi Perfil"
        description="Actualiza tu información personal y contraseña."
        icon={UserCircle}
      />
      <Card className="shadow-xl rounded-lg w-full max-w-3xl mx-auto border-border/50">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <UserCog className="h-6 w-6 text-primary"/> Información del Usuario
          </CardTitle>
          <CardDescription>Estos son los detalles de tu cuenta. Mantenlos actualizados.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24 border-2 border-primary/50 shadow-md">
                    <AvatarImage src={imagePreview || ''} alt={user?.name || "Usuario"} />
                    <AvatarFallback className="text-3xl bg-muted">{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                   <FormField
                      control={form.control}
                      name="profilePicture"
                      render={({ field: { onChange, value, ...rest }}) => (
                        <FormItem>
                          <FormControl>
                            <Button size="sm" variant="outline" asChild>
                              <FormLabel htmlFor="profile-picture-upload" className="flex items-center gap-2 cursor-pointer">
                                <ImageUp className="h-4 w-4" />
                                Cambiar foto
                                <Input 
                                  id="profile-picture-upload"
                                  type="file" 
                                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                                  className="hidden"
                                  onChange={(e) => onChange(e.target.files)}
                                  {...rest}
                                />
                              </FormLabel>
                            </Button>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                </div>
                <div className="w-full">
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
                </div>
              </div>
              
              <Card className="p-4 pt-2 bg-muted/30 border-border/30">
                <CardHeader className="p-0 mb-3">
                    <CardTitle className="text-lg font-headline flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-primary" /> Cambiar Contraseña (Opcional)
                    </CardTitle>
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
