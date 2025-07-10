
"use client";

import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export interface MockProduct {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: string;
}

interface ProductExportPreviewProps {
  products: MockProduct[];
}

const mockCompanyInfoFallback: EmpresaDataForTemplate = {
    name: "FacturacionHC Predeterminada S.A.C.",
    address: "Av. La Innovación 123, Distrito Tecnológico, Lima, Perú",
    ruc: "20123456789",
    phone: "(01) 555-1234",
    email: "reportes@facturacionhc.com",
    logoUrl: "https://placehold.co/60x60.png?text=FH",
};

export function ProductExportPreview({ products }: ProductExportPreviewProps) {
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
  
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
        case "en stock": return "bg-green-100 text-green-800 border-green-200";
        case "stock bajo": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "agotado": return "bg-red-100 text-red-800 border-red-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

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
              <CardTitle className="text-2xl font-headline text-primary">Reporte de Productos</CardTitle>
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
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{product.id}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", getStatusBadgeClass(product.status))} variant="outline">
                      {product.status}
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
            <p>Total de Productos: {products.length}</p>
            <p className="text-right">Página 1 de 1</p>
        </div>
      </CardFooter>
    </Card>
  );
}
