
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
  email:string;
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
const totalAmount = 2714.00; // This should be dynamic in a real app
const qrData = `https://consulta.sunat.gob.pe/cl-ti-itconsvalicpe/ConsValiCpe.htm?num_ruc=${mockCompanyData.ruc}&tip_doc=01&num_ser=${invoiceId.split('-')[0]}&num_doc=${invoiceId.split('-')[1]}&fec_emi=${new Date().toISOString().split('T')[0]}&mto_tot=${totalAmount.toFixed(2)}`;

export function InvoicePreview() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentDateString, setCurrentDateString] = useState<string>("Calculando...");
  
  useEffect(() => {
    // Simulate fetching company data
    setIsLoading(true);
    setTimeout(() => {
      setCompanyInfo(mockCompanyData);
      setIsLoading(false);
    }, 500);

    const today = new Date();
    setCurrentDateString(today.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }));
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
    <div className="bg-card p-8 rounded-lg shadow-2xl border border-border/50 max-w-4xl mx-auto font-sans text-[12px] text-foreground">
      {/* Header */}
      <header className="grid grid-cols-3 gap-4 mb-8">
        <div className="col-span-2">
          <Image 
            src={companyInfo.logoUrl}
            alt="Company Logo" 
            width={180} 
            height={60}
            className="mb-2"
            data-ai-hint="company logo"
          />
          <p className="font-bold text-base">{companyInfo.name}</p>
          <p>{companyInfo.address}</p>
          <p>Tel: {companyInfo.phone} / Email: {companyInfo.email}</p>
        </div>
        <div className="col-span-1 border-2 border-primary/80 rounded-lg p-2 text-center">
            <h1 className="font-bold text-lg">R.U.C. {companyInfo.ruc}</h1>
            <Separator className="my-1" />
            <h2 className="font-bold text-lg text-primary">FACTURA ELECTRÓNICA</h2>
            <Separator className="my-1" />
            <p className="font-bold text-lg">{invoiceId}</p>
        </div>
      </header>

      {/* Client Info and Dates */}
      <section className="mb-4 grid grid-cols-5 gap-4">
        <div className="col-span-3 border border-border/50 rounded-md p-2">
            <p><span className="font-bold w-[120px] inline-block">Señor(es):</span> Nombre del Cliente S.A. / Razón Social</p>
            <p><span className="font-bold w-[120px] inline-block">Dirección:</span> Dirección del Cliente, Distrito, Ciudad</p>
            <p><span className="font-bold w-[120px] inline-block">R.U.C.:</span> 10234567890</p>
        </div>
         <div className="col-span-2 border border-border/50 rounded-md p-2">
            <p><span className="font-bold w-[130px] inline-block">Fecha de Emisión:</span> {currentDateString}</p>
            <p><span className="font-bold w-[130px] inline-block">Moneda:</span> SOLES</p>
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
            {[
              { item: 1, description: "Servicio de Consultoría Digital Avanzada", quantity: 1, unit: "UND", unitPrice: 800.00, total: 800.00 },
              { item: 2, description: "Desarrollo de Página Web Corporativa (Landing)", quantity: 1, unit: "UND", unitPrice: 1200.00, total: 1200.00 },
              { item: 3, description: "Mantenimiento Mensual Plataforma (Enero)", quantity: 2, unit: "SERV", unitPrice: 150.00, total: 300.00 },
            ].map(row => (
              <TableRow key={row.item} className="hover:bg-muted/20 transition-colors">
                <TableCell className="text-center">{row.quantity}</TableCell>
                <TableCell className="text-center">{row.unit}</TableCell>
                <TableCell className="font-medium">{row.description}</TableCell>
                <TableCell className="text-right">S/ {row.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">S/ {row.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

       {/* Totals and Observations */}
      <section className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2">
            <div className="border border-border/50 rounded-md p-2">
                <p><span className="font-bold text-primary">SON:</span> DOS MIL SETECIENTOS CATORCE Y 00/100 SOLES</p>
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
          <div className="col-span-1 space-y-1">
            <div className="flex justify-between border-b p-1">
                <span className="font-bold">OP. GRAVADA:</span>
                <span className="font-medium">S/ 2300.00</span>
            </div>
             <div className="flex justify-between border-b p-1">
                <span className="font-bold">I.G.V. (18%):</span>
                <span className="font-medium">S/ 414.00</span>
            </div>
            <div className="flex justify-between border-b p-1">
                <span className="font-bold">OP. EXONERADA:</span>
                <span className="font-medium">S/ 0.00</span>
            </div>
             <div className="flex justify-between border-b p-1">
                <span className="font-bold">OP. INAFECTA:</span>
                <span className="font-medium">S/ 0.00</span>
            </div>
            <div className="flex justify-between bg-primary text-primary-foreground p-2 rounded-md">
                <span className="font-bold text-base">IMPORTE TOTAL:</span>
                <span className="font-bold text-base">S/ {totalAmount.toFixed(2)}</span>
            </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground pt-4 mt-4 border-t border-border/50">
        <p>Gracias por su preferencia.</p>
      </footer>
    </div>
  );
}
