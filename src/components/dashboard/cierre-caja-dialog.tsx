
"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface Session {
  IdCaja: number;
  MontoInicial: number;
  FechaApertura: string;
}

interface CierreCajaDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: (closedSession: any) => void;
  session: Session | null;
}

export function CierreCajaDialog({ isOpen, onOpenChange, onSuccess, session }: CierreCajaDialogProps) {
  const [montoReal, setMontoReal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ventasEnEfectivo, setVentasEnEfectivo] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if(isOpen && session) {
      // In a real app, fetch this value from the server based on session start time
      // e.g., fetch(`/api/caja/ventas-efectivo?desde=${session.FechaApertura}`)
      // For now, we use mock data.
      setVentasEnEfectivo(1150.50);
    }
  }, [isOpen, session]);

  if (!session) return null;
  
  const montoCalculado = (session.MontoInicial || 0) + ventasEnEfectivo;
  const montoRealNum = parseFloat(montoReal) || 0;
  const diferencia = montoRealNum - montoCalculado;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (montoReal === "") {
      toast({ variant: "destructive", title: "Monto requerido", description: "Debe ingresar el monto contado." });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = { 
        idCaja: session.IdCaja, 
        montoReal: montoRealNum, 
        montoCalculado, 
        diferencia, 
        idUsuario: user?.id || 1 // Fallback for demo
      };

      const res = await fetch("/api/caja", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'cierre', ...payload }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      toast({
         variant: "success",
         title: <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-white" /><span>Caja Cerrada</span></div>,
         description: `La sesión de caja ha sido cerrada exitosamente.`,
      });
      onSuccess(result.session);
      onOpenChange(false);
      setMontoReal("");

    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "No se pudo cerrar la caja." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Arqueo y Cierre de Caja</DialogTitle>
          <DialogDescription>Realiza el conteo del efectivo y cierra la sesión actual.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Monto Inicial</Label>
                    <p className="font-bold text-lg">S/ {session.MontoInicial.toFixed(2)}</p>
                </div>
                <div>
                    <Label>Ventas en Efectivo (Sistema)</Label>
                    <p className="font-bold text-lg">S/ {ventasEnEfectivo.toFixed(2)}</p>
                </div>
            </div>
            <div>
                <Label>Total Calculado por Sistema</Label>
                <p className="font-bold text-xl text-primary">S/ {montoCalculado.toFixed(2)}</p>
            </div>
            <hr />
            <div>
                <Label htmlFor="monto-real">Monto Contado en Caja (Real)</Label>
                <Input
                    id="monto-real"
                    type="number"
                    value={montoReal}
                    onChange={(e) => setMontoReal(e.target.value)}
                    placeholder="Ingrese el total contado"
                    className="mt-2"
                />
            </div>
            {montoReal !== "" && (
                <div className={cn(
                    "p-3 rounded-md text-center",
                    diferencia === 0 && "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
                    diferencia > 0 && "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
                    diferencia < 0 && "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
                )}>
                    <Label>Diferencia (Sobrante/Faltante)</Label>
                    <p className="font-bold text-2xl">{diferencia.toFixed(2)}</p>
                </div>
            )}
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Cerrando..." : "Confirmar y Cerrar Caja"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
