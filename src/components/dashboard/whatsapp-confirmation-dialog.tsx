
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface WhatsappConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  saleData: { id: string; customer: string; clientPhone: string; } | null;
  onConfirm: (phoneNumber: string, updateClient: boolean, saleId: string, customerName: string) => void;
}

export function WhatsappConfirmationDialog({ isOpen, onOpenChange, saleData, onConfirm }: WhatsappConfirmationDialogProps) {
  const [selection, setSelection] = useState<'existing' | 'new'>('existing');
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [updateClientRecord, setUpdateClientRecord] = useState(false);
  const { toast } = useToast();

  const hasExistingPhone = saleData?.clientPhone && saleData.clientPhone.trim() !== "";

  useEffect(() => {
    if (isOpen && saleData) {
      setSelection(hasExistingPhone ? 'existing' : 'new');
      setNewPhoneNumber('');
      setUpdateClientRecord(false);
    }
  }, [isOpen, saleData, hasExistingPhone]);

  if (!saleData) return null;

  const handleSubmit = () => {
    let finalPhoneNumber = selection === 'existing' ? saleData.clientPhone : newPhoneNumber;
    
    if (selection === 'new' && !newPhoneNumber) {
        toast({
            variant: "destructive",
            title: "Número Requerido",
            description: "Por favor, ingrese el nuevo número de teléfono.",
        });
        return;
    }

    if (!finalPhoneNumber || !/^(?:\+?\d{1,3})?\d{7,15}$/.test(finalPhoneNumber.replace(/\s+/g, ''))) {
        toast({
            variant: "destructive",
            title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Número Inválido</div>,
            description: "Por favor, ingrese un número de teléfono válido (ej: 51987654321 o 987654321).",
        });
        return;
    }
    
    const shouldUpdate = selection === 'new' && updateClientRecord && !hasExistingPhone;
    
    onConfirm(finalPhoneNumber.replace(/\s+/g, ''), shouldUpdate, saleData.id, saleData.customer);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Confirmar Envío por WhatsApp</DialogTitle>
          <DialogDescription>
            Elige el número de teléfono para enviar el comprobante a <span className="font-semibold text-foreground">{saleData.customer}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Recuerda descargar el PDF primero para poder adjuntarlo en WhatsApp.</p>
          </div>
          
          <RadioGroup 
            value={selection} 
            onValueChange={(value) => setSelection(value as 'existing' | 'new')}
            className="grid gap-4"
          >
            {/* Option 1: Existing Number */}
            <div 
              onClick={() => hasExistingPhone && setSelection('existing')}
              className={cn(
                "flex items-center space-x-3 rounded-md border p-4 transition-colors",
                !hasExistingPhone ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent/50',
                selection === 'existing' && 'bg-accent/50 border-primary'
              )}
            >
              <RadioGroupItem value="existing" id="r-existing" disabled={!hasExistingPhone} />
              <Label htmlFor="r-existing" className={cn("flex flex-col", !hasExistingPhone ? 'cursor-not-allowed' : 'cursor-pointer')}>
                <span className="font-medium">Usar número registrado</span>
                <span className="text-sm text-muted-foreground">{hasExistingPhone ? saleData.clientPhone : 'No hay número registrado'}</span>
              </Label>
            </div>

            {/* Option 2: New Number */}
            <div 
              onClick={() => setSelection('new')}
              className={cn(
                "flex flex-col items-start space-y-3 rounded-md border p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                selection === 'new' && 'bg-accent/50 border-primary'
              )}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="new" id="r-new" />
                <Label htmlFor="r-new" className="font-medium cursor-pointer">Enviar a un nuevo número</Label>
              </div>
              {selection === 'new' && (
                <div className="pl-7 space-y-3 w-full animate-accordion-down" onClick={(e) => e.stopPropagation()}>
                  <Input
                    id="whatsapp-new-phone"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                    placeholder="Ej: 51987654321"
                    className="w-full"
                  />
                  {!hasExistingPhone && (
                    <div className="flex items-center space-x-2">
                       <Checkbox
                          id="update-client-phone"
                          checked={updateClientRecord}
                          onCheckedChange={(checked) => setUpdateClientRecord(!!checked)}
                        />
                        <Label htmlFor="update-client-phone" className="text-sm font-normal cursor-pointer">
                          Guardar este número en el registro del cliente
                        </Label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Confirmar y Enviar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
