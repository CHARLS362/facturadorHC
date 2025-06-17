
"use client";

import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const renderThemeToggle = () => {
    if (!mounted) {
      return (
        <Button variant="ghost" size="icon" className="h-9 w-9 opacity-0" aria-label="Toggle theme">
          <Sun className="h-5 w-5" />
        </Button>
      );
    }
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        className="h-10 w-10 text-foreground hover:bg-accent hover:text-accent-foreground rounded-full"
      >
        {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-background dark:from-slate-900 dark:via-sky-950 dark:to-background flex flex-col items-center justify-center p-4 selection:bg-primary/20 selection:text-primary">
      
      <div className="absolute top-4 right-4 z-20">
        {renderThemeToggle()}
      </div>
      
      {/* Animated Wave Elements */}
      <div className="absolute bottom-0 left-0 w-full h-[200px] sm:h-[250px] md:h-[300px] z-0 opacity-40">
        <div className="absolute bottom-0 left-0 w-full h-full bg-primary/30 rounded-t-[100%] animate-ocean-wave-1"></div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[150px] sm:h-[200px] md:h-[250px] z-1 opacity-50">
        <div className="absolute bottom-0 left-0 w-full h-full bg-accent/40 rounded-t-[100%] animate-ocean-wave-2" style={{animationDelay: '1s'}}></div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[100px] sm:h-[150px] md:h-[200px] z-2 opacity-60">
         <div className="absolute bottom-0 left-0 w-full h-full bg-primary/50 rounded-t-[100%] animate-ocean-wave-3" style={{animationDelay: '0.5s'}}></div>
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
