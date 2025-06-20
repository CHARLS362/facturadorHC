
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Mail, KeyRound, CheckCircle, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

// Schemas for each step
const emailSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un correo electrónico válido." }),
});

const otpSchema = z.object({
  otp: z.string().min(4, { message: "El código debe tener 4 dígitos." }),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8, { message: "La nueva contraseña debe tener al menos 8 caracteres." }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

type Step = "enterEmail" | "enterOtp" | "resetPassword" | "success";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("enterEmail");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Forms for each step
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  // Handlers
  const handleEmailSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);
    console.log("Requesting OTP for:", data.email);
    // Simulate backend call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setEmail(data.email);
    setStep("enterOtp");
    toast({
      variant: "success",
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>Código Enviado</span>
        </div>
      ),
      description: "Se ha enviado un código de recuperación a tu correo.",
    });
  };

  const handleOtpSubmit = async (data: OtpFormValues) => {
    setIsLoading(true);
    console.log("Verifying OTP:", data.otp);
    // Simulate backend call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate success/failure
    if (data.otp === "1234") { // Mock success OTP
        setStep("resetPassword");
        toast({ 
            variant: "success",
            title: (
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Código Correcto</span>
                </div>
            ),
            description: "Por favor, establece tu nueva contraseña." 
        });
    } else {
        toast({ title: "Código Incorrecto", description: "El código ingresado no es válido.", variant: "destructive" });
        otpForm.setError("otp", { message: "Código incorrecto." });
    }
    setIsLoading(false);
  };

  const handlePasswordSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    console.log("Resetting password for:", email);
    // Simulate backend call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep("success");
    toast({ 
        variant: "success",
        title: (
            <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Contraseña Actualizada</span>
            </div>
        ),
        description: "Tu contraseña ha sido cambiada exitosamente." 
    });
  };
  
  const renderStepContent = () => {
    switch (step) {
      case "enterEmail":
        return (
          <>
            <CardHeader className="p-0 mb-7 text-center">
              <CardTitle className="font-headline text-2xl text-foreground">Recuperar Contraseña</CardTitle>
              <CardDescription className="text-muted-foreground">Ingresa tu correo para recibir un código de verificación.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                         <FormControl>
                            <div className="relative">
                               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input type="email" placeholder="Correo Electrónico" {...field} className="pl-10"/>
                            </div>
                         </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full font-headline" disabled={isLoading}>
                    {isLoading ? "Enviando..." : "Enviar Código de Recuperación"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        );

      case "enterOtp":
        return (
          <>
            <CardHeader className="p-0 mb-7 text-center">
              <CardTitle className="font-headline text-2xl text-foreground">Verificar Código</CardTitle>
              <CardDescription className="text-muted-foreground">
                Ingresa el código de 4 dígitos enviado a <span className="font-bold text-primary">{email}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-6">
                        <FormField
                        control={otpForm.control}
                        name="otp"
                        render={({ field }) => (
                            <FormItem className="flex flex-col items-center">
                            <FormControl>
                                <InputOTP maxLength={4} {...field}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                </InputOTPGroup>
                                </InputOTP>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" className="w-full font-headline" disabled={isLoading}>
                            {isLoading ? "Verificando..." : "Verificar Código"}
                        </Button>
                    </form>
                </Form>
                <div className="text-center mt-4 text-sm">
                    <Button variant="link" onClick={() => setStep("enterEmail")} disabled={isLoading}>Ingresar otro correo</Button>
                </div>
            </CardContent>
          </>
        );

      case "resetPassword":
        return (
            <>
            <CardHeader className="p-0 mb-7 text-center">
                <CardTitle className="font-headline text-2xl text-foreground">Establecer Nueva Contraseña</CardTitle>
                <CardDescription className="text-muted-foreground">Crea una nueva contraseña segura para tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
                    <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                             <FormControl>
                                <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="Nueva Contraseña" {...field} className="pl-10"/>
                                </div>
                             </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                             <FormControl>
                                <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="Confirmar Contraseña" {...field} className="pl-10"/>
                                </div>
                             </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full font-headline" disabled={isLoading}>
                        {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                    </Button>
                </form>
                </Form>
            </CardContent>
            </>
        );

      case "success":
        return (
            <>
            <CardHeader className="p-0 mb-7 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="font-headline text-2xl text-foreground">¡Éxito!</CardTitle>
                <CardDescription className="text-muted-foreground">Tu contraseña ha sido actualizada correctamente.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Button className="w-full" asChild>
                    <Link href="/login">Volver a Iniciar Sesión</Link>
                </Button>
            </CardContent>
            </>
        );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-4 selection:bg-primary/20 selection:text-primary bg-gradient-to-br from-sky-700 via-blue-800 to-indigo-900 bg-[length:200%_200%] animate-gradient-pan">
       <div className="absolute top-4 left-4 z-20">
          <Button variant="outline" size="icon" asChild className="rounded-full bg-white/10 text-white hover:bg-white/20 border-white/30">
            <Link href="/login">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
      </div>
      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-md">
        <div className="mx-auto mb-6">
            <Image 
              src="https://placehold.co/180x50.png?text=FacturaHC" 
              alt="FacturacionHC Logo" 
              width={180} 
              height={50}
              className="block"
              data-ai-hint="modern business logo"
            />
          </div>
        <Card className="w-full max-w-md shadow-2xl animate-fade-in bg-card rounded-2xl p-8 lg:p-10">
          {renderStepContent()}
        </Card>
      </main>
    </div>
  );
}
