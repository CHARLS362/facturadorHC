
"use client";

import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

export function ProductExportPreview({ products }: ProductExportPreviewProps) {
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
              src="https://placehold.co/60x60.png?text=FH"
              alt="FacturacionHC Logo"
              width={60}
              height={60}
              className="rounded-md print:block"
              data-ai-hint="modern business logo"
            />
            <div>
              <CardTitle className="text-2xl font-headline text-primary">Reporte de Productos</CardTitle>
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
