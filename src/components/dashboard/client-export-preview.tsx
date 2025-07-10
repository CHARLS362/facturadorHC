
"use client";

import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import type { EmpresaDataForTemplate } from "@/components/templates/invoice-preview";

export interface MockClient {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  type: "Empresa" | "Persona";
  registrationDate: string;
}

interface ClientExportPreviewProps {
  clients: MockClient[];
}

const mockCompanyInfoFallback: EmpresaDataForTemplate = {
    name: "FacturacionHC Predeterminada S.A.C.",
    address: "Av. La Innovación 123, Distrito Tecnológico, Lima, Perú",
    ruc: "20123456789",
    phone: "(01) 555-1234",
    email: "reportes@facturacionhc.com",
    logoUrl: "https://placehold.co/60x60.png",
};

export function ClientExportPreview({ clients }: ClientExportPreviewProps) {
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

  return (
    <Card id="printable-area" className="w-full max-w-4xl mx-auto shadow-md border bg-card print:shadow-none print:border-0 print:bg-transparent">
      <CardHeader className="px-6 py-4 md:p-8 border-b">
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
              <CardTitle className="text-2xl font-headline text-primary">Reporte de Clientes</CardTitle>
              <CardDescription>Generado el: {currentDate}</CardDescription>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="font-semibold">FacturacionHC</p>
            <p className="text-sm text-muted-foreground">reportes@facturacionhc.com</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre / Razón Social</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{client.id}</TableCell>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.contactName}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.type}</TableCell>
                  <TableCell>{client.registrationDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 md:p-8 border-t text-sm text-muted-foreground">
        <div className="w-full flex justify-between items-center">
            <p>Total de Clientes: {clients.length}</p>
            <p className="text-right">Página 1 de 1</p>
        </div>
      </CardFooter>
    </Card>
  );
}
