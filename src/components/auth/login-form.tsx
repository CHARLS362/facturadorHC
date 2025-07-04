"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Mail, Lock, LogIn, AlertTriangle, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image"; 
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      await login(data, data.rememberMe || false);
      // On successful login, the AuthContext will handle redirection.
    } catch (error: any) {
      // The AuthContext now throws the error, so we can catch it here.
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error.message || "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md lg:max-w-sm shadow-2xl animate-fade-in bg-card rounded-2xl p-8 lg:p-10" style={{ animationDelay: '0.4s' }}>
      <CardHeader className="p-0 mb-7 text-center">
        <div className="lg:hidden mx-auto mb-6">
             <Image
              src="/image/logoHC.png"
              alt="FacturacionHC Logo"
              width={150}
              height={40}
              className="block"
            />
        </div>
        <CardTitle className="font-headline text-2xl text-foreground">Iniciar Sesión</CardTitle>
        <CardDescription className="text-muted-foreground">
          Si no tienes una cuenta, contacta a soporte.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input
                          type="email"
                          placeholder="Correo Electrónico"
                          {...field}
                          className="w-full text-sm pl-10 pr-4 py-3 bg-muted/70 dark:bg-muted/30 border border-border rounded-lg focus:bg-card focus:border-primary transition-all duration-300"
                          aria-label="Correo Electrónico"
                        />
                    </div>
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
                  <div className="relative">
                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Contraseña"
                        {...field}
                        className="w-full text-sm pl-10 pr-10 py-3 bg-muted/70 dark:bg-muted/30 border border-border rounded-lg focus:bg-card focus:border-primary transition-all duration-300"
                        aria-label="Contraseña"
                      />
                    </FormControl>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground hover:text-primary"
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
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Recordarme"
                        id="rememberMeLogin"
                      />
                    </FormControl>
                    <Label htmlFor="rememberMeLogin" className="text-sm text-muted-foreground cursor-pointer font-normal">
                        Recordarme
                    </Label>
                  </FormItem>
                )}
              />
              <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full font-headline bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-lg tracking-wide transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="mr-2 h-5 w-5" />
                  Iniciar Sesión
                </div>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
