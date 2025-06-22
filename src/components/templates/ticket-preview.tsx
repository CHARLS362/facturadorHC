
"use client";

import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface BusinessInfo {
  name: string;
  address: string;
  ruc: string;
  phone: string;
  logoUrl: string;
}

const mockBusinessData: BusinessInfo = {
  name: "Mi Cafetería Express",
  address: "Jr. Los Pinos 456, Miraflores",
  ruc: "10987654321",
  phone: "987-654-321",
  logoUrl: "https://placehold.co/120x40.png?text=Mi+Café",
};

const ticketId = "B001-00054321";
const qrData = `https://consulta.sunat.gob.pe/cl-ti-itconsvalicpe/ConsValiCpe.htm?num_ruc=${mockBusinessData.ruc}&tip_doc=03&num_ser=${ticketId.split('-')[0]}&num_doc=${ticketId.split('-')[1]}&fec_emi=${new Date().toISOString().split('T')[0]}&mto_tot=32.45`;

export function TicketPreview() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDateTimeString, setCurrentDateTimeString] = useState<string>("Calculando...");

  useEffect(() => {
    // Simulate fetching business data
    setIsLoading(true);
    setTimeout(() => {
      setBusinessInfo(mockBusinessData);
      setIsLoading(false);
    }, 500);

    setCurrentDateTimeString(new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }));
  }, []);

  const items = [
    { name: "Café Americano", quantity: 2, price: 7.00 },
    { name: "Croissant de Almendras", quantity: 1, price: 8.50 },
    { name: "Jugo de Naranja Fresco", quantity: 1, price: 10.00 },
  ];
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  if (isLoading || !businessInfo) {
      return (
          <div className="bg-card p-6 rounded-lg shadow-xl border border-border/30 max-w-sm mx-auto font-mono text-xs space-y-4">
              <header className="text-center space-y-2">
                  <Skeleton className="h-[40px] w-[120px] mx-auto" />
                  <Skeleton className="h-5 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
              </header>
              <Skeleton className="h-px w-full" />
              <div className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
              </div>
               <Skeleton className="h-px w-full" />
               <div className="space-y-2">
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-3/6" />
               </div>
          </div>
      )
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-xl border border-border/30 max-w-sm mx-auto font-mono text-xs text-foreground">
      {/* Header */}
      <header className="text-center mb-4">
        <Image 
          src={businessInfo.logoUrl}
          alt="Business Logo" 
          width={120} 
          height={40}
          className="mx-auto mb-2"
          data-ai-hint="small business logo"
        />
        <p className="font-bold text-sm">{businessInfo.name}</p>
        <p>{businessInfo.address}</p>
        <p>RUC: {businessInfo.ruc}</p>
        <p>Tel: {businessInfo.phone}</p>
      </header>

      <Separator className="my-3 border-dashed border-border/70" />

      {/* Ticket Info */}
      <section className="mb-3 text-center">
        <p className="font-bold text-sm">BOLETA DE VENTA ELECTRÓNICA</p>
        <p>{ticketId}</p>
      </section>
      
      <Separator className="my-3 border-dashed border-border/70" />

      <section className="mb-3">
        <p><span className="font-semibold">Fecha/Hora:</span> {currentDateTimeString}</p>
        <p><span className="font-semibold">Cajero:</span> María L.</p>
        <p><span className="font-semibold">Cliente:</span> Varios (Código 0000)</p>
      </section>

      <Separator className="my-3 border-dashed border-border/70" />

      {/* Items */}
      <section className="mb-3">
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-1 mb-1 font-semibold">
          <span>Descripción</span>
          <span className="text-right">Cant.</span>
          <span className="text-right">Importe</span>
        </div>
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-[2fr_1fr_1fr] gap-1 py-0.5">
            <span>{item.name}</span>
            <span className="text-right">{item.quantity}</span>
            <span className="text-right">S/ {(item.quantity * item.price).toFixed(2)}</span>
          </div>
        ))}
      </section>

      <Separator className="my-3 border-dashed border-border/70" />

      {/* Totals */}
      <section className="mb-4 space-y-1">
        <div className="flex justify-between">
          <span className="font-semibold">SUBTOTAL:</span>
          <span>S/ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">IGV (18%):</span>
          <span>S/ {igv.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm">
          <span className="font-headline">TOTAL A PAGAR:</span>
          <span className="font-headline">S/ {total.toFixed(2)}</span>
        </div>
      </section>
      
      <Separator className="my-3 border-dashed border-border/70" />

      {/* Payment & QR */}
      <section className="mb-4 text-center">
        <p>Forma de Pago: TARJETA VISA **** **** **** 1234</p>
        <Image 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}`} 
          alt="Código QR de la Boleta" 
          width={80} 
          height={80}
          className="mx-auto my-2"
          data-ai-hint="qr code receipt"
        />
        <p className="text-xs">Representación impresa de la Boleta de Venta Electrónica.</p>
        <p className="text-xs">Consulte su documento en: www.minegocio.com/consulta</p>
      </section>
      
      <Separator className="my-3 border-dashed border-border/70" />
      
      {/* Footer */}
      <footer className="text-center">
        <p className="font-semibold">¡Gracias por su compra!</p>
        <p>Vuelva pronto</p>
      </footer>
    </div>
  );
}
