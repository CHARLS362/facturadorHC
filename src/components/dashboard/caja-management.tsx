
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AperturaCajaDialog } from "./apertura-caja-dialog";
import { CierreCajaDialog } from "./cierre-caja-dialog";
import { CajaStatus } from "./caja-status";
import { HistorialCaja } from "./historial-caja";

interface Session {
  IdCaja: number;
  MontoInicial: number;
  FechaApertura: string;
  UsuarioApertura?: string;
  // Add other fields as necessary
}

interface HistoryItem {
  IdCaja: number;
  FechaCierre: string;
  MontoInicial: number;
  MontoFinalCalculado: number;
  MontoFinalReal: number;
  Diferencia: number;
}

interface CajaManagementProps {
  initialActiveSession: Session | null;
  initialHistory: HistoryItem[];
}

export function CajaManagement({ initialActiveSession, initialHistory }: CajaManagementProps) {
  const [activeSession, setActiveSession] = useState<Session | null>(initialActiveSession);
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);
  const [isAperturaOpen, setIsAperturaOpen] = useState(false);
  const [isCierreOpen, setIsCierreOpen] = useState(false);

  const handleAperturaSuccess = (newSession: Session) => {
    setActiveSession(newSession);
  };

  const handleCierreSuccess = (closedSession: HistoryItem) => {
    setActiveSession(null);
    setHistory(prev => [closedSession, ...prev]);
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Estado Actual de la Caja</CardTitle>
          <CardDescription>
            {activeSession ? "La caja se encuentra abierta. Puedes registrar ventas." : "La caja está cerrada. Debes abrirla para empezar a operar."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeSession ? (
            <CajaStatus session={activeSession} onCierreClick={() => setIsCierreOpen(true)} />
          ) : (
            <div className="text-center p-6 border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-medium">Caja Cerrada</h3>
              <p className="text-muted-foreground mb-4">Inicia una nueva sesión para registrar ventas.</p>
              <Button onClick={() => setIsAperturaOpen(true)}>Abrir Caja</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <HistorialCaja history={history} />

      <AperturaCajaDialog
        isOpen={isAperturaOpen}
        onOpenChange={setIsAperturaOpen}
        onSuccess={handleAperturaSuccess}
      />

      <CierreCajaDialog
        isOpen={isCierreOpen}
        onOpenChange={setIsCierreOpen}
        onSuccess={handleCierreSuccess}
        session={activeSession}
      />
    </>
  );
}
