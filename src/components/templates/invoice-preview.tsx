
"use client";

import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import React from "react";

// Types
export interface VentaDataForTemplate {
  id: string;
  fecha: string;
  cliente: {
    nombre: string;
    documento: string;
    tipoDocumento: string;
    direccion?: string;
  };
  items: Array<{
    cantidad: number;
    unidad: string;
    nombre: string;
    precioUnitario: number;
    total: number;
  }>;
  opGravada: number;
  igv: number;
  totalGeneral: number;
  totalEnLetras: string;
  paymentMethod: string;
}

export interface EmpresaDataForTemplate {
  name: string;
  address: string;
  ruc: string;
  phone: string;
  email:string;
  logoUrl: string;
}

interface InvoicePreviewProps {
  venta: VentaDataForTemplate;
  empresa: EmpresaDataForTemplate;
}

export function InvoicePreview({ venta, empresa }: InvoicePreviewProps) {
  const fechaEmision = new Date(venta.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const qrData = `https://consulta.sunat.gob.pe/cl-ti-itconsvalicpe/ConsValiCpe.htm?num_ruc=${empresa.ruc}&tip_doc=01&num_ser=${venta.id.split('-')[0]}&num_doc=${venta.id.split('-')[1]}&fec_emi=${new Date(venta.fecha).toISOString().split('T')[0]}&mto_tot=${venta.totalGeneral.toFixed(2)}`;

  return (
    <div className="bg-card p-8 rounded-lg border border-border/50 max-w-4xl mx-auto font-sans text-[12px] text-foreground w-[210mm] min-h-[297mm] print:border-0 print:shadow-none print:h-auto print:min-h-0">
      {/* Header */}
      <header className="grid grid-cols-3 gap-8 mb-8">
        <div className="col-span-2">
            <div className="h-[70px] mb-4">
              <Image 
                src={empresa.logoUrl}
                alt="Company Logo" 
                width={240}
                height={70}
                className="h-full w-auto object-contain object-left"
                data-ai-hint="company logo"
              />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-lg">{empresa.name}</p>
              <p className="text-sm">{empresa.address}</p>
              <p className="text-sm">Tel: {empresa.phone} / Email: {empresa.email}</p>
            </div>
        </div>
        <div className="col-span-1 border border-primary/80 rounded-lg p-3 text-center flex flex-col justify-center">
            <h1 className="font-bold text-lg">R.U.C. {empresa.ruc}</h1>
            <Separator className="my-2 bg-border" />
            <h2 className="font-bold text-lg text-primary">FACTURA ELECTRÓNICA</h2>
            <Separator className="my-2 bg-border" />
            <p className="font-bold text-lg tracking-wider">{venta.id}</p>
        </div>
      </header>

      {/* Client Info and Dates */}
      <section className="mb-6 grid grid-cols-5 gap-4">
        <div className="col-span-3 border border-border/50 rounded-md p-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <span className="font-bold">Señor(es):</span> <span>{venta.cliente.nombre}</span>
            <span className="font-bold">Dirección:</span> <span>{venta.cliente.direccion || 'No especificada'}</span>
            <span className="font-bold">{venta.cliente.tipoDocumento}:</span> <span>{venta.cliente.documento}</span>
        </div>
         <div className="col-span-2 border border-border/50 rounded-md p-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <span className="font-bold">Fecha de Emisión:</span> <span>{fechaEmision}</span>
            <span className="font-bold">Moneda:</span> <span>SOLES</span>
        </div>
      </section>

      {/* Items Table */}
      <section className="mb-4">
        <Table>
          <TableHeader className="bg-primary/10">
            <TableRow>
              <TableHead className="font-bold text-foreground w-[10%]">CANT.</TableHead>
              <TableHead className="font-bold text-foreground w-[15%]">UNIDAD</TableHead>
              <TableHead className="font-bold text-foreground w-[45%]">DESCRIPCIÓN</TableHead>
              <TableHead className="text-right font-bold text-foreground w-[15%]">P. UNIT.</TableHead>
              <TableHead className="text-right font-bold text-foreground w-[15%]">IMPORTE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {venta.items.map((row, index) => (
              <TableRow key={index} className="border-b-border/50 hover:bg-muted/20 transition-colors">
                <TableCell className="text-center">{row.cantidad}</TableCell>
                <TableCell className="text-center">{row.unidad}</TableCell>
                <TableCell className="font-medium">{row.nombre}</TableCell>
                <TableCell className="text-right">S/ {row.precioUnitario.toFixed(2)}</TableCell>
                <TableCell className="text-right">S/ {row.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

       {/* Totals and Observations */}
      <section className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="border border-border/50 rounded-md p-2">
                <p><span className="font-bold text-primary">SON:</span> {venta.totalEnLetras}</p>
            </div>
            <div className="border border-border/50 rounded-md p-2">
                <h3 className="font-bold mb-1">OBSERVACIONES:</h3>
                <p className="text-xs">El pago debe realizarse dentro de los 30 días posteriores a la fecha de emisión. Se aplicará un cargo por mora del 2% mensual sobre saldos vencidos.</p>
            </div>
             <div className="flex justify-start items-center gap-4 pt-2">
                <Image 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(qrData)}`}
                    alt="Código QR de la Factura" 
                    width={90} 
                    height={90}
                    data-ai-hint="qr code"
                />
                <div className="text-xs text-muted-foreground">
                    <p>Representación impresa de la FACTURA ELECTRÓNICA, consulte en <br/> https://www.sunat.gob.pe/</p>
                    <p>Autorizado mediante Resolución de Intendencia N° 034-005-0005555/SUNAT</p>
                </div>
            </div>
          </div>
          <div className="col-span-1 space-y-2 text-sm">
            <div className="flex justify-between items-center py-1">
                <span className="font-bold">OP. GRAVADA:</span>
                <span className="font-medium">S/ {venta.opGravada.toFixed(2)}</span>
            </div>
             <Separator />
             <div className="flex justify-between items-center py-1">
                <span className="font-bold">I.G.V. (18%):</span>
                <span className="font-medium">S/ {venta.igv.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-1">
                <span className="font-bold">OP. EXONERADA:</span>
                <span className="font-medium">S/ 0.00</span>
            </div>
             <Separator />
             <div className="flex justify-between items-center py-1">
                <span className="font-bold">OP. INAFECTA:</span>
                <span className="font-medium">S/ 0.00</span>
            </div>
            <div className="flex justify-between bg-primary text-primary-foreground p-2 mt-2 rounded-md">
                <span className="font-bold">IMPORTE TOTAL:</span>
                <span className="font-bold">S/ {venta.totalGeneral.toFixed(2)}</span>
            </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground pt-6 mt-6 border-t border-border/50">
        <p>Gracias por su preferencia.</p>
      </footer>
    </div>
  );
}
