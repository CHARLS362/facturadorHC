
"use client";

import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import React from "react";
import type { VentaDataForTemplate, EmpresaDataForTemplate } from "./invoice-preview";


interface TicketPreviewProps {
  venta: VentaDataForTemplate;
  empresa: EmpresaDataForTemplate;
}

export function TicketPreview({ venta, empresa }: TicketPreviewProps) {
  const currentDateTimeString = new Date(venta.fecha).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
  const qrData = `https://consulta.sunat.gob.pe/cl-ti-itconsvalicpe/ConsValiCpe.htm?num_ruc=${empresa.ruc}&tip_doc=03&num_ser=${venta.id.split('-')[0]}&num_doc=${venta.id.split('-')[1]}&fec_emi=${new Date(venta.fecha).toISOString().split('T')[0]}&mto_tot=${venta.totalGeneral.toFixed(2)}`;
  
  return (
    <div className="bg-card p-6 rounded-lg shadow-xl border-border/30 max-w-sm mx-auto font-mono text-xs text-foreground w-[80mm] print:border-0 print:shadow-none">
      {/* Header */}
      <header className="text-center mb-4">
        <Image 
          src={empresa.logoUrl}
          alt="Business Logo" 
          width={150} 
          height={50}
          className="mx-auto mb-2 object-contain h-[50px] w-auto"
          data-ai-hint="small business logo"
        />
        <p className="font-bold text-lg text-primary">{empresa.name}</p>
        <p>{empresa.address}</p>
        <p>RUC: {empresa.ruc}</p>
        <p>Tel: {empresa.phone}</p>
      </header>

      <Separator className="my-3 border-dashed border-border/70" />

      {/* Ticket Info */}
      <section className="mb-3 text-center">
        <p className="font-bold text-sm text-primary">BOLETA DE VENTA ELECTRÓNICA</p>
        <p>{venta.id}</p>
      </section>
      
      <Separator className="my-3 border-dashed border-border/70" />

      <section className="mb-3">
        <p><span className="font-semibold">Fecha/Hora:</span> {currentDateTimeString}</p>
        <p><span className="font-semibold">Cajero:</span> María L.</p> {/* This is still mock */}
        <p><span className="font-semibold">Cliente:</span> {venta.cliente.nombre}</p>
        <p><span className="font-semibold">{venta.cliente.tipoDocumento}:</span> {venta.cliente.documento}</p>
      </section>

      <Separator className="my-3 border-dashed border-border/70" />

      {/* Items */}
      <section className="mb-3">
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-1 mb-1 font-semibold text-primary">
          <span>Descripción</span>
          <span className="text-right">Cant.</span>
          <span className="text-right">Importe</span>
        </div>
        {venta.items.map((item, index) => (
          <div key={index} className="grid grid-cols-[2fr_1fr_1fr] gap-1 py-0.5">
            <span>{item.nombre}</span>
            <span className="text-right">{item.cantidad}</span>
            <span className="text-right">S/ {item.total.toFixed(2)}</span>
          </div>
        ))}
      </section>

      <Separator className="my-3 border-dashed border-border/70" />

      {/* Totals */}
      <section className="mb-4 space-y-1">
        <div className="flex justify-between">
          <span className="font-semibold">SUBTOTAL:</span>
          <span>S/ {venta.opGravada.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">IGV (18%):</span>
          <span>S/ {venta.igv.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg text-primary mt-2 pt-2 border-t border-dashed border-border/70">
          <span className="font-headline">TOTAL A PAGAR:</span>
          <span className="font-headline">S/ {venta.totalGeneral.toFixed(2)}</span>
        </div>
      </section>
      
      <Separator className="my-3 border-dashed border-border/70" />

      {/* Payment & QR */}
      <section className="mb-4 text-center">
        <p>Forma de Pago: {venta.paymentMethod}</p>
        <Image 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}`} 
          alt="Código QR de la Boleta" 
          width={80} 
          height={80}
          className="mx-auto my-2"
          data-ai-hint="qr code receipt"
        />
        <p className="text-xs">Representación impresa de la Boleta de Venta Electrónica.</p>
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
