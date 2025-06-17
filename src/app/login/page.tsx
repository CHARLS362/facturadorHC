import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';
import { FileText, DollarSign, TrendingUp, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/20 to-background bg-[length:400%_400%] animate-gradient-flow flex flex-col items-center justify-center p-4 selection:bg-primary/20 selection:text-primary">
      
      {/* Animated Floating Elements */}
      <FileText className="absolute top-[10%] left-[10%] h-16 w-16 text-primary/20 opacity-70 animate-float-subtle-1" style={{ animationDelay: '0s' }} />
      <DollarSign className="absolute top-[20%] right-[15%] h-12 w-12 text-accent/20 opacity-60 animate-float-subtle-2" style={{ animationDelay: '1s' }}/>
      <TrendingUp className="absolute bottom-[15%] left-[20%] h-14 w-14 text-primary/15 opacity-70 animate-float-subtle-3" style={{ animationDelay: '2s' }}/>
      <ShieldCheck className="absolute bottom-[10%] right-[10%] h-10 w-10 text-accent/15 opacity-60 animate-float-subtle-1" style={{ animationDelay: '3s' }}/>
      
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full filter blur-2xl animate-pulse-slow opacity-50"></div>
      <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-accent/5 rounded-full filter blur-2xl animate-pulse-slow animation-delay-2000 opacity-50"></div>


      <main className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Image 
            src="https://placehold.co/150x50.png?text=FacturaHC" 
            alt="FacturacionHC Logo" 
            width={180} 
            height={60}
            className="mx-auto mb-2"
            data-ai-hint="modern business logo"
          />
          <h1 className="text-3xl font-headline font-semibold text-foreground">Bienvenido de Nuevo</h1>
          <p className="text-muted-foreground">Inicia sesión para continuar gestionando tu negocio.</p>
        </div>
        <LoginForm />
        <p className="mt-8 text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '1s' }}>
          © {new Date().getFullYear()} FacturacionHC. Todos los derechos reservados.
        </p>
      </main>
    </div>
  );
}
