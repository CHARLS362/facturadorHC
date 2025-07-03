
"use client";

import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";


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

export function SaleExportPreview({ sales }: SaleExportPreviewProps) {
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

  const getStatusBadgeVariant = (status: string): VariantProps<typeof badgeVariants>["variant"] => {
    switch (status.toLowerCase()) {
      case "pagado": return "default";
      case "pendiente": return "secondary";
      case "anulado": return "destructive";
      default: return "outline";
    }
  };

  return (
    <Card id="printable-area" className="w-full max-w-4xl mx-auto shadow-md border bg-card print:shadow-none print:border-0 print:bg-transparent">
      <CardHeader className="px-6 py-4 md:p-8 border-b">
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
              <CardTitle className="text-2xl font-headline text-primary">Reporte de Ventas</CardTitle>
              <CardDescription>Generado el: {currentDate}</CardDescription>
            </div>
          </div>
          <div className="text-left md:text-right mt-4 md:mt-0">
            <p className="font-bold text-lg">FacturacionHC</p>
            <p className="text-sm text-muted-foreground">reportes@facturacionhc.com</p>
            <p className="text-sm text-muted-foreground">www.facturacionhc.com</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="overflow-x-auto">
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
                <TableRow key={sale.id} className="hover:bg-muted/30">
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
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 md:p-8 border-t text-sm text-muted-foreground">
        <div className="w-full flex justify-between items-center">
          <p>Total de Ventas: {sales.length}</p>
          <p className="text-right">Página 1 de 1</p>
        </div>
      </CardFooter>
    </Card>
  );
}
