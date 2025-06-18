
"use client";
import Link from 'next/link';
import React, { useState, useMemo } from 'react';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  PlusCircle, 
  Search, 
  ShoppingCart, 
  FileDown, 
  Eye, 
  FileEdit,
  FileText, 
  Receipt,  
  FileCode2, 
  FileCheck2, 
  Printer,
  Send, 
  Mail
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MockSale {
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


const initialMockSales: MockSale[] = [
  { id: "VENTA001", date: "2024-07-20", customer: "Carlos Mendoza", total: "S/ 150.00", status: "Pagado", paymentMethod: "Tarjeta", documentType: "Factura", clientEmail: "carlos.mendoza@example.com", clientPhone: "987654321" },
  { id: "VENTA002", date: "2024-07-19", customer: "Luisa Fernandez", total: "S/ 85.50", status: "Pendiente", paymentMethod: "Efectivo", documentType: "Boleta", clientEmail: "luisa.fernandez@example.com", clientPhone: "912345678" },
  { id: "VENTA003", date: "2024-07-19", customer: "Ana Torres", total: "S/ 220.00", status: "Pagado", paymentMethod: "Transferencia", documentType: "Factura", clientEmail: "ana.torres@example.com", clientPhone: "999888777" },
  { id: "VENTA004", date: "2024-07-18", customer: "Jorge Vargas", total: "S/ 45.00", status: "Anulado", paymentMethod: "Yape", documentType: "Boleta", clientEmail: "jorge.vargas@example.com", clientPhone: "977666555" },
];

export default function VentasPage() {
  const [sales, setSales] = useState<MockSale[]>(initialMockSales);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales;
    return sales.filter(sale =>
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.date.includes(searchTerm) ||
      sale.documentType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sales, searchTerm]);
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pagado": return "default";
      case "pendiente": return "secondary";
      case "anulado": return "destructive";
      default: return "outline";
    }
  };

  const getDocumentIcon = (docType: string) => {
    if (docType.toLowerCase() === "factura") {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
    if (docType.toLowerCase() === "boleta") {
      return <Receipt className="h-5 w-5 text-green-600" />;
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestión de Ventas"
        description="Registra y administra todas las transacciones de ventas."
        icon={ShoppingCart}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar Ventas
            </Button>
            <Button asChild>
              <Link href="/dashboard/ventas/nueva">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Venta
              </Link>
            </Button>
          </div>
        }
      />
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
          <CardDescription>Consulta todas las ventas realizadas y su estado.</CardDescription>
          <div className="pt-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar ventas por ID, cliente, fecha..." 
              className="pl-10 max-w-sm" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
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
                  <TableHead className="text-right min-w-[640px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{sale.id}</TableCell>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell>{sale.customer}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2" title={sale.documentType}>
                        {getDocumentIcon(sale.documentType)}
                        <span className="hidden sm:inline">{sale.documentType}</span>
                      </div>
                    </TableCell>
                    <TableCell>{sale.total}</TableCell>
                    <TableCell>{sale.paymentMethod}</TableCell>
                    <TableCell>
                       <Badge variant={getStatusBadgeVariant(sale.status)} className="capitalize">
                         {sale.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 transition-colors">
                        <Eye className="mr-1.5 h-5 w-5" />
                         <span>Ver</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-yellow-500 hover:text-yellow-600 transition-colors" asChild>
                        <Link href={`/dashboard/ventas/${sale.id}/editar`}>
                          <FileEdit className="mr-1.5 h-5 w-5" />
                          <span>Editar</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 transition-colors">
                        <FileDown className="mr-1.5 h-5 w-5" />
                        <span>PDF</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 transition-colors">
                        <FileCode2 className="mr-1.5 h-5 w-5" />
                        <span>XML</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-600 transition-colors">
                        <FileCheck2 className="mr-1.5 h-5 w-5" />
                        <span>CDR</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                        <Printer className="mr-1.5 h-5 w-5" />
                        <span>Imprimir</span>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="text-green-600 hover:text-green-700 transition-colors">
                        <a href={`https://wa.me/${sale.clientPhone}?text=Detalles%20de%20la%20venta%20${sale.id}`} target="_blank" rel="noopener noreferrer">
                          <Send className="mr-1.5 h-5 w-5" />
                          <span>WhatsApp</span>
                        </a>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="text-orange-500 hover:text-orange-600 transition-colors">
                        <a href={`mailto:${sale.clientEmail}?subject=Venta%20${sale.id}&body=Hola,%0AAdjunto%20los%20detalles%20de%20la%20venta%20${sale.id}.%0ASaludos.`}>
                          <Mail className="mr-1.5 h-5 w-5" />
                          <span>Email</span>
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
           {filteredSales.length === 0 && searchTerm && (
            <p className="text-center text-muted-foreground py-4">No se encontraron ventas con "{searchTerm}".</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

