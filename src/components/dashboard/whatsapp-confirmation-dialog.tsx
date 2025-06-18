
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

interface WhatsappConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  saleData: { id: string; customer: string; clientPhone: string; } | null;
  onConfirm: (phoneNumber: string, updateClient: boolean, saleId: string, customerName: string) => void;
}

export function WhatsappConfirmationDialog({ isOpen, onOpenChange, saleData, onConfirm }: WhatsappConfirmationDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [updateClientRecord, setUpdateClientRecord] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (saleData) {
      setPhoneNumber(saleData.clientPhone || "");
      setUpdateClientRecord(false); // Reset checkbox each time dialog opens for a new sale
    }
  }, [saleData]);

  if (!saleData) return null;

  const handleSubmit = () => {
    // Basic validation: allow digits, optionally starting with '+', and reasonable length.
    // Peru phone numbers are typically 9 digits, plus country code 51.
    // A simple regex for common international format like +51987654321 or local 987654321
    if (!/^(?:\+?\d{1,3})?\d{7,15}$/.test(phoneNumber.replace(/\s+/g, ''))) { 
        toast({
            variant: "destructive",
            title: (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Número Inválido
              </div>
            ),
            description: "Por favor, ingrese un número de teléfono válido (ej: 51987654321 o 987654321).",
        });
        return;
    }
    onConfirm(phoneNumber.replace(/\s+/g, ''), updateClientRecord, saleData.id, saleData.customer);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Confirmar Envío por WhatsApp</DialogTitle>
          <DialogDescription>
            Revisa el número de teléfono para <span className="font-semibold text-foreground">{saleData.customer}</span>. Puedes actualizarlo si es necesario.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="whatsapp-phone" className="text-right col-span-1 text-sm">
              Teléfono
            </Label>
            <Input
              id="whatsapp-phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="col-span-3"
              placeholder="Ej: 51987654321"
            />
          </div>
          <div className="flex items-center space-x-2 col-start-2 col-span-3">
            <Checkbox
              id="update-client-phone"
              checked={updateClientRecord}
              onCheckedChange={(checked) => setUpdateClientRecord(!!checked)}
            />
            <Label htmlFor="update-client-phone" className="text-sm font-normal cursor-pointer">
              Actualizar número en el registro del cliente
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Confirmar y Enviar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
