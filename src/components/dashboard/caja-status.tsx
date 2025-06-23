
"use client";
import { Button } from "@/components/ui/button";

interface Session {
  MontoInicial: number;
  FechaApertura: string;
  UsuarioApertura?: string;
}

interface CajaStatusProps {
  session: Session;
  onCierreClick: () => void;
}

export function CajaStatus({ session, onCierreClick }: CajaStatusProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Monto de Apertura</p>
          <p className="text-2xl font-bold">S/ {session.MontoInicial.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Fecha de Apertura</p>
          <p className="text-xl font-semibold">{new Date(session.FechaApertura).toLocaleString('es-PE')}</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Usuario Apertura</p>
          <p className="text-xl font-semibold">{session.UsuarioApertura || 'Admin'}</p>
        </div>
      </div>
      <div className="text-center pt-4">
         <Button size="lg" onClick={onCierreClick}>Realizar Arqueo y Cierre de Caja</Button>
      </div>
    </div>
  );
}
