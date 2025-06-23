
"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { CheckCircle2 } from "lucide-react";

export function AperturaCajaDialog({ isOpen, onOpenChange, onSuccess }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; onSuccess: (session: any) => void; }) {
  const [montoInicial, setMontoInicial] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth(); // Assuming user object contains an ID

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const amount = parseFloat(montoInicial);
    if (isNaN(amount) || amount < 0) {
      toast({ variant: "destructive", title: "Monto inválido", description: "Por favor, ingrese un número positivo." });
      setIsSubmitting(false);
      return;
    }

    try {
      // In a real app, you would get the user ID from your auth context
      const payload = { montoInicial: amount, idUsuario: user?.id || 1 }; // Fallback to 1 for demo
      const res = await fetch("/api/caja", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'apertura', ...payload }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      toast({
         variant: "success",
         title: <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-white" /><span>Caja Abierta</span></div>,
         description: `La caja se abrió con un monto inicial de S/ ${amount.toFixed(2)}.`,
      });
      onSuccess(result.session);
      onOpenChange(false);
      setMontoInicial("");

    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "No se pudo abrir la caja." });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apertura de Caja</DialogTitle>
          <DialogDescription>Ingrese el monto inicial en efectivo para comenzar la jornada.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="monto-inicial">Monto Inicial (S/)</Label>
          <Input
            id="monto-inicial"
            type="number"
            value={montoInicial}
            onChange={(e) => setMontoInicial(e.target.value)}
            placeholder="Ej: 100.00"
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Abriendo..." : "Abrir Caja"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
