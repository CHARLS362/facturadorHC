
"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, AlertTriangle } from "lucide-react";

interface BarcodeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  product: { id: string | number; name: string; sku?: string | null; } | null;
}

export function BarcodeDialog({ isOpen, onOpenChange, product }: BarcodeDialogProps) {
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  useEffect(() => {
    setBarcodeError(null);
    if (isOpen && product && barcodeRef.current) {
      const valueToEncode = product.sku || String(product.id);

      if (!valueToEncode || String(valueToEncode).trim() === "") {
        setBarcodeError("Valor inválido para generar el código.");
        if (barcodeRef.current) barcodeRef.current.innerHTML = '';
        return;
      }
      
      try {
        JsBarcode(barcodeRef.current, String(valueToEncode), {
          format: "CODE128",
          lineColor: "#000000",
          background: "#ffffff",
          width: 2,
          height: 80,
          displayValue: true,
          fontOptions: "bold",
          fontSize: 16,
          textMargin: 5
        });
      } catch (e) {
        console.error("Failed to generate barcode:", e);
        setBarcodeError("Error al generar código. Verifique el SKU.");
        if (barcodeRef.current) barcodeRef.current.innerHTML = '';
      }
    }
  }, [isOpen, product]);

  if (!product) return null;

  const handlePrint = () => {
    if (!barcodeRef.current || !product || barcodeError) return;
    
    const printContent = `
      <div style="text-align: center; font-family: sans-serif; page-break-inside: avoid;">
        <h3 style="margin-bottom: 10px; font-size: 16px; font-weight: bold;">${product.name}</h3>
        ${barcodeRef.current.outerHTML}
      </div>
    `;

    const printWindow = window.open('', '', 'height=400,width=800');

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Imprimir: ${product.name}</title>
            <style>
              @media print {
                @page { size: auto; margin: 10mm; }
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Código de Barras</DialogTitle>
          <DialogDescription>
            Código de barras generado para el producto: <strong>{product.name}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex flex-col justify-center items-center bg-white rounded-md text-black">
          <p className="font-bold text-center mb-2 px-2">{product.name}</p>
          <svg ref={barcodeRef}></svg>
          {barcodeError && (
            <div className="mt-4 text-red-600 text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {barcodeError}
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-end">
           <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" /> Cerrar
          </Button>
          <Button type="button" onClick={handlePrint} disabled={!!barcodeError}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
