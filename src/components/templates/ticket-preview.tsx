
"use client";

import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import React, { useState, useEffect } from "react";

export function TicketPreview() {
  const [currentDateTimeString, setCurrentDateTimeString] = useState<string>("Calculando...");

  useEffect(() => {
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

  return (
    <div className="bg-card p-6 rounded-lg shadow-xl border border-border/30 max-w-sm mx-auto font-mono text-xs text-foreground">
      {/* Header */}
      <header className="text-center mb-4">
        <Image 
          src="https://placehold.co/120x40.png?text=Mi+Negocio" 
          alt="Business Logo" 
          width={100} 
          height={33}
          className="mx-auto mb-2"
          data-ai-hint="small business logo"
        />
        <p className="font-bold text-sm">Nombre de Mi Negocio</p>
        <p>Jr. Los Pinos 456, Miraflores</p>
        <p>RUC: 10987654321</p>
        <p>Tel: 987-654-321</p>
      </header>

      <Separator className="my-3 border-dashed border-border/70" />

      {/* Ticket Info */}
      <section className="mb-3 text-center">
        <p className="font-bold text-sm">BOLETA DE VENTA ELECTRÓNICA</p>
        <p>B001-00054321</p>
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
          src="https://placehold.co/80x80.png?text=QR" 
          alt="QR Code" 
          width={70} 
          height={70}
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
