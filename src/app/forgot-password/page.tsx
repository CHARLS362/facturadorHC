
"use client";

import Link from 'next/link';
import { ArrowLeft, Mail, KeyRound, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";

// Schemas for each step
const emailSchema = z.object({
  email: z.string().email({ message: "Por favor, ingresa un correo válido." }),
});
const otpSchema = z.object({
  pin: z.string().min(4, { message: "El código debe tener 4 dígitos." }),
});
const resetSchema = z.object({
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type Step = 'email' | 'otp' | 'reset' | 'success';

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { toast } = useToast();
  const [generatedCode, setGeneratedCode] = useState("");


  const getCurrentSchema = () => {
    switch (currentStep) {
      case 'otp': return otpSchema;
      case 'reset': return resetSchema;
      case 'email':
      default:
        return emailSchema;
    }
  };
  
  const form = useForm({
    resolver: zodResolver(getCurrentSchema()),
    shouldUnregister: false, // Keep values between steps
    defaultValues: {
      email: "",
      pin: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: any) => {
    console.log(`Submitting for step: ${currentStep}`, data);
    // Simulate API calls
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (currentStep === 'email') {
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString();

      try {
        const res = await fetch('/api/send-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, code: randomCode }),
        });

        if (!res.ok) throw new Error('Error al enviar código');

        setUserEmail(data.email);
        setGeneratedCode(randomCode);
        setCurrentStep('otp');
        toast({
          title: "Código Enviado",
          description: `Se ha enviado un código de 4 dígitos a ${data.email}.`,
          variant: "success",
        });
        form.reset({ ...form.getValues(), pin: '' });
      } catch (error) {
        toast({
          title: "Error al enviar",
          description: "No se pudo enviar el correo. ",
          variant: "destructive",
        });
      }
    } else if (currentStep === 'otp') {
      // Simulate OTP validation
      if (data.pin === generatedCode) {// Mock correct OTP
        setCurrentStep('reset');
        toast({ title: "Código Verificado", description: "Ahora puedes establecer una nueva contraseña.", variant: 'success' });
        form.reset({ ...form.getValues(), password: '', confirmPassword: '' }); // Reset password fields
      } else {
        toast({ title: "Código Inválido", description: "El código ingresado es incorrecto. Intenta de nuevo.", variant: 'destructive' });
        form.setError("pin", { type: "manual", message: "Código incorrecto." });
      }
      } else if (currentStep === 'reset') {
        try {
          const res = await fetch('/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, password: data.password }),
          });

          if (!res.ok) {
            const result = await res.json();
            throw new Error(result.message || 'Error al cambiar la contraseña');
          }

          toast({
            title: "Contraseña actualizada",
            description: "Ahora puedes iniciar sesión con tu nueva contraseña.",
            variant: "success",
          });

          setCurrentStep('success');
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Hubo un problema al cambiar la contraseña.",
            variant: "destructive",
          });
        }
      }

  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 'email':
        return (
          <>
            <CardHeader className="p-0 mb-7 text-center">
              <CardTitle className="font-headline text-2xl text-foreground">Recuperar Contraseña</CardTitle>
              <CardDescription className="text-muted-foreground">
                Ingresa tu correo para recibir un código de verificación.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
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
                          placeholder="tu.correo@ejemplo.com"
                          {...field}
                          className="w-full text-sm pl-10 pr-4 py-3"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full mt-6 font-headline bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-lg tracking-wide transition-all duration-300 transform hover:scale-105"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div> : "Enviar Código"}
              </Button>
            </CardContent>
          </>
        );
      case 'otp':
        return (
          <>
            <CardHeader className="p-0 mb-7 text-center">
              <CardTitle className="font-headline text-2xl text-foreground">Verificar Código</CardTitle>
              <CardDescription className="text-muted-foreground">
                Ingresa el código de 4 dígitos enviado a <span className="font-bold text-foreground">{userEmail}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <FormField
                    control={form.control}
                    name="pin"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="flex justify-center">
                                <InputOTP maxLength={4} {...field}>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                    </InputOTPGroup>
                                </InputOTP>
                                </div>
                            </FormControl>
                            <FormMessage className="text-center" />
                        </FormItem>
                    )}
                />
                 <Button
                    type="submit"
                    className="w-full mt-6 font-headline bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-lg tracking-wide transition-all duration-300 transform hover:scale-105"
                    disabled={form.formState.isSubmitting}
                 >
                    {form.formState.isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div> : "Verificar"}
                </Button>
            </CardContent>
          </>
        );
      case 'reset':
        return (
          <>
            <CardHeader className="p-0 mb-7 text-center">
              <CardTitle className="font-headline text-2xl text-foreground">Nueva Contraseña</CardTitle>
              <CardDescription className="text-muted-foreground">
                Establece una nueva contraseña para tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
                 <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                         <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nueva contraseña"
                                    {...field}
                                    className="w-full text-sm pl-10 pr-10 py-3"
                                />
                            </FormControl>
                            <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                         </div>
                         <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                         <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirmar nueva contraseña"
                                    {...field}
                                    className="w-full text-sm pl-10 pr-10 py-3"
                                />
                            </FormControl>
                            <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                         </div>
                         <FormMessage />
                        </FormItem>
                    )}
                />
                 <Button
                    type="submit"
                    className="w-full mt-2 font-headline bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-lg tracking-wide transition-all duration-300 transform hover:scale-105"
                    disabled={form.formState.isSubmitting}
                 >
                    {form.formState.isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div> : "Guardar Contraseña"}
                </Button>
            </CardContent>
          </>
        );
      case 'success':
        return (
             <div className="text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-400 mb-4" />
                <h2 className="text-2xl font-bold text-foreground">¡Éxito!</h2>
                <p className="text-muted-foreground mt-2">Tu contraseña ha sido actualizada correctamente.</p>
                <Button asChild className="mt-6 w-full font-headline bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-lg tracking-wide transition-all duration-300 transform hover:scale-105">
                    <Link href="/login">Volver al Inicio de Sesión</Link>
                </Button>
            </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-4 selection:bg-primary/20 selection:text-primary bg-gradient-to-br from-sky-700 via-blue-800 to-indigo-900 bg-[length:200%_200%] animate-gradient-pan">
      <main className="relative z-10 w-full max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="w-full bg-card shadow-xl animate-fade-in rounded-2xl p-8 lg:p-10">
              {renderStepContent()}
            </Card>
          </form>
        </Form>

         {currentStep !== 'success' && (
            <Button asChild variant="link" className="mt-6 text-sky-200/80 hover:text-white">
                <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Inicio de Sesión
                </Link>
            </Button>
        )}
      </main>
    </div>
  );
}
