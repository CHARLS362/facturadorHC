import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-md text-center">
        <h1 className="text-3xl font-headline font-semibold text-foreground mb-4">Recuperación de Contraseña</h1>
        <p className="text-muted-foreground mb-8">
          Esta funcionalidad aún no está implementada.
        </p>
        <Button asChild variant="outline">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Login
          </Link>
        </Button>
      </main>
    </div>
  );
}
