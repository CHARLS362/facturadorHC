
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

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-4 selection:bg-primary/20 selection:text-primary bg-gradient-to-br from-sky-700 via-blue-800 to-indigo-900 bg-[length:200%_200%] animate-gradient-pan">
      
      <div className="absolute top-4 right-4 z-20">
         <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={!mounted ? "Cambiar tema" : (theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro")}
            className="h-10 w-10 text-white hover:bg-white/20 hover:text-white rounded-full"
          >
            {!mounted ? (
              <Sun className="h-5 w-5" />
            ) : theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
      </div>

      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-center w-full max-w-4xl">
        {/* Welcome Text Section (for larger screens) */}
        <div className="hidden lg:flex flex-col self-center text-left lg:px-14 lg:max-w-md xl:max-w-lg mb-10 lg:mb-0 animate-fade-in">
          <div className="mx-auto lg:mx-0 mb-6">
            <Image 
              src="https://placehold.co/180x50.png?text=FacturaHC" 
              alt="FacturacionHC Logo" 
              width={180} 
              height={50}
              className="block"
              data-ai-hint="modern business logo"
            />
          </div>
          <h1 className="my-3 font-headline font-semibold text-4xl text-white">Bienvenido de Nuevo</h1>
          <p className="pr-3 text-sm text-sky-100/80 opacity-80">
            Gestiona tu facturación de forma eficiente y moderna. Accede a todas tus herramientas con un solo clic.
          </p>
        </div>

        {/* Login Form Section */}
        <div className="flex justify-center self-center w-full lg:w-auto">
          <LoginForm />
        </div>
      </main>

      {mounted && (
        <p 
          className="absolute bottom-6 text-center text-sm text-sky-200/70 animate-fade-in" 
          style={{ animationDelay: '1s' }}
        >
          © {new Date().getFullYear()} FacturacionHC. Todos los derechos reservados.
        </p>
      )}
    </div>
  );
}
