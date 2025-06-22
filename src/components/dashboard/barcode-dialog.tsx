
"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

interface BarcodeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  product: { id: string | number; name: string; } | null;
}

export function BarcodeDialog({ isOpen, onOpenChange, product }: BarcodeDialogProps) {
  const barcodeRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (isOpen && product && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, String(product.id), {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 80,
          displayValue: true,
          fontOptions: "bold",
          fontSize: 18,
          textMargin: 5
        });
      } catch (e) {
        console.error("Failed to generate barcode:", e);
      }
    }
  }, [isOpen, product]);

  if (!product) return null;

  const handlePrint = () => {
    if (!barcodeRef.current) return;
    
    const printContent = barcodeRef.current.outerHTML;
    const printWindow = window.open('', '', 'height=400,width=800');

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Imprimir: ${product.name}</title></head>
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
            Código de barras para el producto: <strong>{product.name}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex justify-center items-center bg-white rounded-md">
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
