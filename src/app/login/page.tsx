import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col items-center justify-center p-4 selection:bg-primary/20 selection:text-primary">
      <div className="absolute inset-0 opacity-5">
        {/* Subtle background pattern or image if desired */}
      </div>
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
