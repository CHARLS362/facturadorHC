
"use client";

import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EmpresaDataForTemplate } from "@/components/templates/invoice-preview";

export interface MockSale {
  id: string;
  date: string;
  customer: string;
  total: string;
  status: string;
  paymentMethod: string;
  documentType: "Factura" | "Boleta";
  clientEmail: string;
  clientPhone: string;
}

interface SaleExportPreviewProps {
  sales: MockSale[];
}

const mockCompanyInfoFallback: EmpresaDataForTemplate = {
    name: "FacturacionHC Predeterminada S.A.C.",
    address: "Av. La Innovación 123, Distrito Tecnológico, Lima, Perú",
    ruc: "20123456789",
    phone: "(01) 555-1234",
    email: "reportes@facturacionhc.com",
    logoUrl: "https://placehold.co/60x60.png?text=FH",
};

export function SaleExportPreview({ sales }: SaleExportPreviewProps) {
  const [currentDate, setCurrentDate] = useState("");
  const [companyInfo, setCompanyInfo] = useState<EmpresaDataForTemplate>(mockCompanyInfoFallback);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    
    try {
        const savedSettings = localStorage.getItem('companySettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setCompanyInfo({
                name: parsed.companyName || mockCompanyInfoFallback.name,
                address: parsed.companyAddress || mockCompanyInfoFallback.address,
                ruc: parsed.companyRuc || mockCompanyInfoFallback.ruc,
                phone: parsed.companyPhone || mockCompanyInfoFallback.phone,
                email: parsed.companyEmail || mockCompanyInfoFallback.email,
                logoUrl: parsed.companyLogoUrl || mockCompanyInfoFallback.logoUrl,
            });
        }
    } catch(e) {
        console.error("Failed to load company settings for export preview", e);
    }
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pagado": return "default";
      case "pendiente": return "secondary";
      case "anulado": return "destructive";
      default: return "outline";
    }
  };

  return (
    <Card id="printable-area" className="w-full max-w-4xl mx-auto shadow-none border-0 print:shadow-none print:border-0">
      <CardHeader className="px-2 py-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <Image
              src={companyInfo.logoUrl}
              alt="FacturacionHC Logo"
              width={60}
              height={60}
              className="rounded-md print:block object-contain"
              data-ai-hint="modern business logo"
            />
            <div>
              <CardTitle className="text-2xl font-headline">Reporte de Ventas</CardTitle>
              <CardDescription>Generado el: {currentDate}</CardDescription>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="font-semibold">{companyInfo.name}</p>
            <p className="text-sm text-muted-foreground">{companyInfo.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Venta</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo Doc.</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Método Pago</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-mono text-xs">{sale.id}</TableCell>
                <TableCell>{sale.date}</TableCell>
                <TableCell className="font-medium">{sale.customer}</TableCell>
                <TableCell>{sale.documentType}</TableCell>
                <TableCell>{sale.total}</TableCell>
                <TableCell>{sale.paymentMethod}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(sale.status)} className="capitalize text-xs">
                    {sale.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="px-2 py-4 md:p-6 text-sm text-muted-foreground">
        <p>Total de Ventas: {sales.length}</p>
      </CardFooter>
    </Card>
  );
}
