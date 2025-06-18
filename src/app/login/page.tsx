
"use client";

import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';
import { Sun, Moon, FileText, Share2, Network, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear());
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

  const animatedIcons = [
    { Icon: FileText, className: "animate-float-diag-1", style: { top: '15%', left: '10%', animationDelay: '0s'} },
    { Icon: Share2, className: "animate-float-diag-2", style: { top: '25%', left: '80%', animationDelay: '1s'} },
    { Icon: Network, className: "animate-float-diag-1", style: { top: '70%', left: '15%', animationDelay: '2s'} },
    { Icon: Activity, className: "animate-float-diag-2", style: { top: '80%', left: '75%', animationDelay: '0.5s'} },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-anim-blue flex flex-col items-center justify-center p-4 selection:bg-primary/20 selection:text-primary">
      
      <div className="absolute top-4 right-4 z-20">
        {renderThemeToggle()}
      </div>

      {/* Animated Background Elements */}
      {mounted && animatedIcons.map(({ Icon, className, style }, index) => (
        <Icon
          key={index}
          className={`absolute w-12 h-12 md:w-16 md:h-16 text-primary/20 dark:text-primary/10 opacity-70 ${className}`}
          style={style}
          strokeWidth={1.5}
        />
      ))}
      
      <div className="absolute top-1/4 left-1/4 w-40 h-40 md:w-56 md:h-56 bg-blue-300/20 dark:bg-blue-700/20 rounded-full filter blur-2xl animate-pulse-slow opacity-50"></div>
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 md:w-48 md:h-48 bg-sky-300/20 dark:bg-sky-700/20 rounded-full filter blur-2xl animate-pulse-slow opacity-50 animation-delay-2000"></div>


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
        {mounted && currentYear !== null && (
          <p className="mt-8 text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '1s' }}>
            © {currentYear} FacturacionHC. Todos los derechos reservados.
          </p>
        )}
         {!mounted && ( // Fallback for SSR to avoid empty space or layout shift
          <p className="mt-8 text-center text-sm text-muted-foreground opacity-0">
            © Loading year...
          </p>
        )}
      </main>
    </div>
  );
}
