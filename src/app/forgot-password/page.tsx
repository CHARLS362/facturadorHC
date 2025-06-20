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
      setUserEmail(data.email);
      setCurrentStep('otp');
      toast({
        title: "Código Enviado",
        description: `Se ha enviado un código de 4 dígitos a ${data.email}.`,
        variant: "success",
      });
      form.reset({ ...form.getValues(), pin: '' }); // Reset only the pin field for the next step
    } else if (currentStep === 'otp') {
      // Simulate OTP validation
      if (data.pin === '1234') { // Mock correct OTP
        setCurrentStep('reset');
        toast({ title: "Código Verificado", description: "Ahora puedes establecer una nueva contraseña.", variant: 'success' });
        form.reset({ ...form.getValues(), password: '', confirmPassword: '' }); // Reset password fields
      } else {
        toast({ title: "Código Inválido", description: "El código ingresado es incorrecto. Intenta de nuevo.", variant: 'destructive' });
        form.setError("pin", { type: "manual", message: "Código incorrecto." });
      }
    } else if (currentStep === 'reset') {
      setCurrentStep('success');
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 'email':
        return (
          <>
            <CardHeader className="p-0 mb-7 text-center">
              <CardTitle className="font-headline text-2xl text-white">Recuperar Contraseña</CardTitle>
              <CardDescription className="text-sky-200/80">
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
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-200/80" />
                        <Input
                          type="email"
                          placeholder="tu.correo@ejemplo.com"
                          {...field}
                          className="w-full text-sm pl-10 pr-4 py-3 bg-white/10 text-white placeholder:text-sky-200/60 border border-white/20 rounded-lg focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-yellow-300" />
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
              <CardTitle className="font-headline text-2xl text-white">Verificar Código</CardTitle>
              <CardDescription className="text-sky-200/80">
                Ingresa el código de 4 dígitos enviado a <span className="font-bold text-white">{userEmail}</span>.
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
                            <FormMessage className="text-center text-yellow-300" />
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
              <CardTitle className="font-headline text-2xl text-white">Nueva Contraseña</CardTitle>
              <CardDescription className="text-sky-200/80">
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
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-200/80" />
                            <FormControl>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nueva contraseña"
                                    {...field}
                                    className="w-full text-sm pl-10 pr-10 py-3 bg-white/10 text-white placeholder:text-sky-200/60 border border-white/20 rounded-lg focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                                />
                            </FormControl>
                            <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-sky-200/80 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                         </div>
                         <FormMessage className="text-yellow-300" />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                         <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-200/80" />
                            <FormControl>
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirmar nueva contraseña"
                                    {...field}
                                    className="w-full text-sm pl-10 pr-10 py-3 bg-white/10 text-white placeholder:text-sky-200/60 border border-white/20 rounded-lg focus:bg-white/20 focus:border-white/50 transition-all duration-300"
                                />
                            </FormControl>
                            <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-sky-200/80 hover:text-white" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                         </div>
                         <FormMessage className="text-yellow-300" />
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
                <h2 className="text-2xl font-bold text-white">¡Éxito!</h2>
                <p className="text-sky-200/80 mt-2">Tu contraseña ha sido actualizada correctamente.</p>
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
            <Card className="w-full bg-black/20 backdrop-blur-lg border border-white/10 shadow-2xl animate-fade-in rounded-2xl p-8 lg:p-10">
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
