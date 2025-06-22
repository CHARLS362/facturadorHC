
"use client";

import Image from "next/image";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CompanyInfo {
  name: string;
  address: string;
  ruc: string;
  phone: string;
  email: string;
  logoUrl: string;
}

const mockCompanyData: CompanyInfo = {
  name: "FacturacionHC Predeterminada S.A.C.",
  address: "Av. La Innovación 123, Distrito Tecnológico, Lima, Perú",
  ruc: "20123456789",
  phone: "(01) 555-1234",
  email: "ventas@facturacionhc.com",
  logoUrl: "https://placehold.co/180x60.png?text=Mi+Logo",
};

const invoiceId = "F001-00012345";
const qrData = `https://consulta.sunat.gob.pe/cl-ti-itconsvalicpe/ConsValiCpe.htm?num_ruc=${mockCompanyData.ruc}&tip_doc=01&num_ser=${invoiceId.split('-')[0]}&num_doc=${invoiceId.split('-')[1]}&fec_emi=${new Date().toISOString().split('T')[0]}&mto_tot=2714.00`;

export function InvoicePreview() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentDateString, setCurrentDateString] = useState<string>("Calculando...");
  const [dueDateString, setDueDateString] = useState<string>("Calculando...");

  useEffect(() => {
    // Simulate fetching company data
    setIsLoading(true);
    setTimeout(() => {
      setCompanyInfo(mockCompanyData);
      setIsLoading(false);
    }, 500);

    const today = new Date();
    setCurrentDateString(today.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }));
    
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 30);
    setDueDateString(dueDate.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  if (isLoading || !companyInfo) {
      return (
          <div className="bg-card p-8 rounded-lg shadow-2xl border border-border/50 max-w-4xl mx-auto space-y-8">
              <header className="flex justify-between items-start">
                  <div>
                      <Skeleton className="h-[60px] w-[180px] mb-2" />
                      <Skeleton className="h-6 w-64 mt-2" />
                      <Skeleton className="h-4 w-72 mt-2" />
                      <Skeleton className="h-4 w-32 mt-1" />
                  </div>
                  <div className="text-right space-y-2">
                      <Skeleton className="h-10 w-48 ml-auto" />
                      <Skeleton className="h-6 w-32 ml-auto" />
                      <Skeleton className="h-4 w-56 ml-auto mt-4" />
                      <Skeleton className="h-4 w-56 ml-auto mt-1" />
                  </div>
              </header>
              <div className="p-4 bg-muted/30 rounded-md border border-border/30 space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
              </div>
          </div>
      );
  }

  return (
    <div className="bg-card p-8 rounded-lg shadow-2xl border border-border/50 max-w-4xl mx-auto font-body text-sm text-foreground">
      {/* Header */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <Image 
            src={companyInfo.logoUrl}
            alt="Company Logo" 
            width={180} 
            height={60}
            className="mb-2"
            data-ai-hint="company logo"
          />
          <p className="font-semibold text-lg">{companyInfo.name}</p>
          <p>{companyInfo.address}</p>
          <p>RUC: {companyInfo.ruc}</p>
          <p>Tel: {companyInfo.phone}</p>
          <p>Email: {companyInfo.email}</p>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-headline font-bold text-primary mb-1">FACTURA</h1>
          <p className="text-lg">{invoiceId}</p>
          <Separator className="my-2 bg-border/70" />
          <p><span className="font-semibold">Fecha de Emisión:</span> {currentDateString}</p>
          <p><span className="font-semibold">Fecha de Vencimiento:</span> {dueDateString}</p>
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
          <p>Titular: {companyInfo.name}</p>
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
            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`}
            alt="Código QR de la Factura" 
            width={100} 
            height={100}
            data-ai-hint="qr code"
        />
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground pt-6 border-t border-border/50">
        <p>Gracias por su preferencia.</p>
        <p>{companyInfo.name} - Innovación para tu negocio.</p>
      </footer>
    </div>
  );
}
