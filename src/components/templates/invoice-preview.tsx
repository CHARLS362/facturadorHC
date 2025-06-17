
"use client";

import Image from "next/image";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import React, { useState, useEffect } from "react";

export function InvoicePreview() {
  const [currentDateString, setCurrentDateString] = useState<string | null>(null);
  const [dueDateString, setDueDateString] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    setCurrentDateString(today.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }));
    setDueDateString(new Date(today.setDate(today.getDate() + 30)).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="bg-card p-8 rounded-lg shadow-2xl border border-border/50 max-w-4xl mx-auto font-body text-sm text-foreground">
      {/* Header */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <Image 
            src="https://placehold.co/150x50.png?text=Mi+Logo" 
            alt="Company Logo" 
            width={150} 
            height={50}
            className="mb-2"
            data-ai-hint="company logo"
          />
          <p className="font-semibold text-lg">Nombre de Mi Empresa S.A.C.</p>
          <p>Av. Principal 123, Lima, Perú</p>
          <p>RUC: 20123456789</p>
          <p>Tel: (01) 555-1234</p>
          <p>Email: ventas@miempresa.com</p>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-headline font-bold text-primary mb-1">FACTURA</h1>
          <p className="text-lg">F001-00012345</p>
          <Separator className="my-2 bg-border/70" />
          <p><span className="font-semibold">Fecha de Emisión:</span> {currentDateString || "Calculando..."}</p>
          <p><span className="font-semibold">Fecha de Vencimiento:</span> {dueDateString || "Calculando..."}</p>
        </div>
      </header>

      {/* Client Info */}
      <section className="mb-8 p-4 bg-muted/30 rounded-md border border-border/30">
        <h2 className="font-headline font-semibold text-md mb-2 text-primary">Cliente:</h2>
        <p className="font-semibold">Nombre del Cliente S.A. / Razón Social</p>
        <p>Dirección del Cliente, Distrito, Ciudad</p>
        <p>RUC / DNI: 10234567890</p>
        <p>Contacto: Nombre Contacto Cliente</p>
      </section>

      {/* Items Table */}
      <section className="mb-8">
        <Table>
          <TableHeader className="bg-primary/10">
            <TableRow>
              <TableHead className="font-headline text-primary">Ítem</TableHead>
              <TableHead className="font-headline text-primary">Descripción</TableHead>
              <TableHead className="text-right font-headline text-primary">Cant.</TableHead>
              <TableHead className="text-right font-headline text-primary">P. Unit.</TableHead>
              <TableHead className="text-right font-headline text-primary">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { item: 1, description: "Servicio de Consultoría Digital Avanzada", quantity: 1, unitPrice: 800.00, total: 800.00 },
              { item: 2, description: "Desarrollo de Página Web Corporativa (Landing)", quantity: 1, unitPrice: 1200.00, total: 1200.00 },
              { item: 3, description: "Mantenimiento Mensual Plataforma (Enero)", quantity: 2, unitPrice: 150.00, total: 300.00 },
            ].map(row => (
              <TableRow key={row.item} className="hover:bg-muted/20 transition-colors">
                <TableCell>{row.item}</TableCell>
                <TableCell className="font-medium">{row.description}</TableCell>
                <TableCell className="text-right">{row.quantity}</TableCell>
                <TableCell className="text-right">S/ {row.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">S/ {row.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="border-t-2 border-primary/30">
              <TableCell colSpan={3}></TableCell>
              <TableCell className="text-right font-semibold">Subtotal:</TableCell>
              <TableCell className="text-right font-semibold">S/ 2300.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3}></TableCell>
              <TableCell className="text-right font-semibold">IGV (18%):</TableCell>
              <TableCell className="text-right font-semibold">S/ 414.00</TableCell>
            </TableRow>
            <TableRow className="bg-primary/10">
              <TableCell colSpan={3}></TableCell>
              <TableCell className="text-right font-bold text-lg font-headline text-primary">Total General:</TableCell>
              <TableCell className="text-right font-bold text-lg font-headline text-primary">S/ 2714.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </section>

      {/* Payment Info & Terms */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-muted/30 rounded-md border border-border/30">
          <h3 className="font-headline font-semibold text-md mb-2 text-primary">Información de Pago:</h3>
          <p>Banco: Banco Ejemplo Perú</p>
          <p>Cuenta Corriente Soles: 123-4567890-0-01</p>
          <p>CCI: 00212300456789000150</p>
          <p>Titular: Nombre de Mi Empresa S.A.C.</p>
        </div>
         <div className="p-4 bg-muted/30 rounded-md border border-border/30">
          <h3 className="font-headline font-semibold text-md mb-2 text-primary">Términos y Condiciones:</h3>
          <p className="text-xs">El pago debe realizarse dentro de los 30 días posteriores a la fecha de emisión. Se aplicará un cargo por mora del 2% mensual sobre saldos vencidos. Todos los servicios están sujetos a nuestros términos estándar.</p>
        </div>
      </section>
      
      {/* QR Code and Legal Text */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div className="text-xs text-muted-foreground">
            <p>Representación impresa de la FACTURA ELECTRÓNICA, consulte en www.sunat.gob.pe</p>
            <p>Autorizado mediante Resolución de Intendencia N° 034-005-0005555/SUNAT</p>
        </div>
        <Image 
            src="https://placehold.co/100x100.png?text=QR" 
            alt="QR Code" 
            width={100} 
            height={100}
            data-ai-hint="qr code"
        />
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground pt-6 border-t border-border/50">
        <p>Gracias por su preferencia.</p>
        <p>FacturacionHC - Innovación para tu negocio.</p>
      </footer>
    </div>
  );
}
