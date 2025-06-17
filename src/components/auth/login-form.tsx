"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Mail, Lock, LogIn, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un email válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock authentication logic
    if (data.email === "test@example.com" && data.password === "password") {
      login(data.email, data.rememberMe || false);
    } else {
      toast({
        variant: "destructive",
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Error de Autenticación
          </div>
        ),
        description: "Email o contraseña incorrectos. Por favor intenta de nuevo.",
      });
    }
    setIsLoading(false);
  }

  return (
    <Card className="w-full shadow-xl animate-fade-in bg-card/80 backdrop-blur-sm border-border/50" style={{ animationDelay: '0.4s' }}>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Iniciar Sesión</CardTitle>
        <CardDescription>Accede a tu panel de FacturacionHC.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                  <FormLabel className="text-foreground/80">Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="tu@email.com" 
                        {...field} 
                        className="pl-10 focus:border-primary transition-all duration-300"
                        aria-label="Email"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <FormLabel className="text-foreground/80">Contraseña</FormLabel>
                  <div className="relative">
                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="pl-10 focus:border-primary transition-all duration-300"
                        aria-label="Contraseña"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: '0.7s' }}>
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Recordarme"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-foreground/80 cursor-pointer">
                        Recordarme
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <Link href="/forgot-password" legacyBehavior>
                <a className="text-sm text-primary hover:underline font-medium transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </Link>
            </div>
            <Button 
              type="submit" 
              className="w-full font-headline bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2 animate-fade-in" 
              disabled={isLoading}
              style={{ animationDelay: '0.8s' }}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
