
"use client";

import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

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

export function ClientExportPreview({ clients }: ClientExportPreviewProps) {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
  }, []);

  return (
    <Card id="printable-area" className="w-full max-w-4xl mx-auto shadow-none border-0 print:shadow-none print:border-0">
      <CardHeader className="px-2 py-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <Image
              src="https://placehold.co/60x60.png?text=FH"
              alt="FacturacionHC Logo"
              width={60}
              height={60}
              className="rounded-md print:block"
              data-ai-hint="modern business logo"
            />
            <div>
              <CardTitle className="text-2xl font-headline">Reporte de Clientes</CardTitle>
              <CardDescription>Generado el: {currentDate}</CardDescription>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="font-semibold">FacturacionHC</p>
            <p className="text-sm text-muted-foreground">reportes@facturacionhc.com</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 md:p-2">
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
              <TableRow key={client.id}>
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
      </CardContent>
      <CardFooter className="px-2 py-4 md:p-6 text-sm text-muted-foreground">
        <p>Total de Clientes: {clients.length}</p>
      </CardFooter>
    </Card>
  );
}
