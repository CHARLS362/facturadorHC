
"use client";

import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import type { EmpresaDataForTemplate } from "@/components/templates/invoice-preview";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedDate: string;
  status: string;
}

interface UserExportPreviewProps {
  users: MockUser[];
}

const mockCompanyInfoFallback: EmpresaDataForTemplate = {
    name: "FacturacionHC Predeterminada S.A.C.",
    address: "Av. La Innovación 123, Distrito Tecnológico, Lima, Perú",
    ruc: "20123456789",
    phone: "(01) 555-1234",
    email: "reportes@facturacionhc.com",
    logoUrl: "https://placehold.co/60x60.png?text=FH",
};

export function UserExportPreview({ users }: UserExportPreviewProps) {
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
              <CardTitle className="text-2xl font-headline">Reporte de Usuarios</CardTitle>
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
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Fecha de Ingreso</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-xs">{user.id}</TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.joinedDate}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${user.status === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {user.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="px-2 py-4 md:p-6 text-sm text-muted-foreground">
        <p>Total de Usuarios: {users.length}</p>
      </CardFooter>
    </Card>
  );
}
