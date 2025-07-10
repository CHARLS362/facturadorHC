"use client";

import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import logoImg from '@/img/facturahc.png';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-4 selection:bg-primary/20 selection:text-primary bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 bg-[length:200%_200%] animate-gradient-pan">
      
      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-center w-full max-w-4xl">
        {/* Welcome Text Section (for larger screens) */}
        <div className="hidden lg:flex flex-col self-center text-left lg:px-14 lg:max-w-md xl:max-w-lg mb-10 lg:mb-0 animate-fade-in">
          <div className="mx-auto lg:mx-0 mb-6">
            <Image 
              src={logoImg} 
              alt="FacturacionHC Logo" 
              width={180} 
              height={50}
              className="block"
              priority
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
