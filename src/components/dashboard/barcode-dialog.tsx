
"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

interface BarcodeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  product: { id: string | number; name: string; sku?: string; } | null;
}

export function BarcodeDialog({ isOpen, onOpenChange, product }: BarcodeDialogProps) {
  const barcodeRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (isOpen && product && barcodeRef.current) {
      // Use SKU if available, otherwise fall back to ID. Ensure it's not an empty string.
      const valueToEncode = product.sku || String(product.id);

      if (!valueToEncode || !valueToEncode.trim()) {
        console.error("Barcode value is empty or invalid.");
        if (barcodeRef.current) barcodeRef.current.innerHTML = ''; // Clear previous barcode
        return;
      }
      
      try {
        JsBarcode(barcodeRef.current, valueToEncode, {
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
        if (barcodeRef.current) barcodeRef.current.innerHTML = '';
      }
    }
  }, [isOpen, product]);

  if (!product) return null;

  const handlePrint = () => {
    if (!barcodeRef.current || !product) return;
    
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
                body { margin: 0; }
              }
            </style>
          </head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
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
        </div>
        <DialogFooter className="sm:justify-end">
           <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" /> Cerrar
          </Button>
          <Button type="button" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
