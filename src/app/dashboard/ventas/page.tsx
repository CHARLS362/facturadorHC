
"use client";
import Link from 'next/link';
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
  FileText, // For Factura
  Receipt,  // For Boleta
  FileCode2, // For XML
  FileCheck2, // For CDR
  Printer,
  Send, // For WhatsApp
  Mail
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockSales = [
  { id: "VENTA001", date: "2024-07-20", customer: "Carlos Mendoza", total: "S/ 150.00", status: "Pagado", paymentMethod: "Tarjeta", documentType: "Factura" },
  { id: "VENTA002", date: "2024-07-19", customer: "Luisa Fernandez", total: "S/ 85.50", status: "Pendiente", paymentMethod: "Efectivo", documentType: "Boleta" },
  { id: "VENTA003", date: "2024-07-19", customer: "Ana Torres", total: "S/ 220.00", status: "Pagado", paymentMethod: "Transferencia", documentType: "Factura" },
  { id: "VENTA004", date: "2024-07-18", customer: "Jorge Vargas", total: "S/ 45.00", status: "Anulado", paymentMethod: "Yape", documentType: "Boleta" },
];

export default function VentasPage() {
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
      return <FileText className="h-4 w-4 text-blue-600" />;
    }
    if (docType.toLowerCase() === "boleta") {
      return <Receipt className="h-4 w-4 text-green-600" />;
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
            <Input placeholder="Buscar ventas por ID, cliente, fecha..." className="pl-10 max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
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
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSales.map((sale) => (
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
                    <Button variant="ghost" size="icon" title="Ver Detalle" className="hover:text-primary transition-colors">
                      <Eye className="h-4 w-4" />
                       <span className="sr-only">Ver Detalle</span>
                    </Button>
                    <Button variant="ghost" size="icon" title="Editar" className="hover:text-accent transition-colors">
                      <FileEdit className="h-4 w-4" />
                       <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon" title="Descargar PDF" className="hover:text-red-500 transition-colors">
                      <FileDown className="h-4 w-4" />
                      <span className="sr-only">Descargar PDF</span>
                    </Button>
                    <Button variant="ghost" size="icon" title="Descargar XML" className="hover:text-blue-500 transition-colors">
                      <FileCode2 className="h-4 w-4" />
                      <span className="sr-only">Descargar XML</span>
                    </Button>
                    <Button variant="ghost" size="icon" title="Descargar CDR" className="hover:text-green-500 transition-colors">
                      <FileCheck2 className="h-4 w-4" />
                      <span className="sr-only">Descargar CDR</span>
                    </Button>
                    <Button variant="ghost" size="icon" title="Imprimir" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                      <Printer className="h-4 w-4" />
                      <span className="sr-only">Imprimir</span>
                    </Button>
                    <Button asChild variant="ghost" size="icon" title="Enviar por WhatsApp" className="hover:text-green-600 transition-colors">
                      <a href={`https://wa.me/?text=Detalles%20de%20la%20venta%20${sale.id}`} target="_blank" rel="noopener noreferrer">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Enviar por WhatsApp</span>
                      </a>
                    </Button>
                    <Button asChild variant="ghost" size="icon" title="Enviar por Email" className="hover:text-orange-500 transition-colors">
                      <a href={`mailto:?subject=Venta%20${sale.id}&body=Hola,%0AAdjunto%20los%20detalles%20de%20la%20venta%20${sale.id}.%0ASaludos.`}>
                        <Mail className="h-4 w-4" />
                        <span className="sr-only">Enviar por Email</span>
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
